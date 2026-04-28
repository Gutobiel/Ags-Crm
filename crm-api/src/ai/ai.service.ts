import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { DataSource } from 'typeorm';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private chatModel: ChatOpenAI;

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource
  ) {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4o-mini',
      temperature: 0.1, // Menos alucinação, mais precisão para leitura de dados
    });
  }

  async processChatMessage(message: string, history: any[] = []): Promise<string> {
    try {
      this.logger.log(`Processando mensagem do usuário com Agente: ${message}`);

      // Mapear histórico para os tipos do LangChain
      const chatHistory = history.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      );

      // 1. Criar as Ferramentas (Tools) para o Agente interagir com o Banco
      const queryDatabaseTool = new DynamicStructuredTool({
        name: 'consultar_banco_crm',
        description: 'Útil para buscar dados reais e estatísticas do CRM, como quantidade de leads, faturamento (orçamentos) e vendedores. Requer que você forneça uma Query SQL (PostgreSQL/MySQL).',
        schema: z.object({
          query: z.string().describe('Query SQL para extrair os dados. Prefira usar COUNT, SUM e GROUP BY.'),
        }),
        func: async ({ query }) => {
          this.logger.log(`IA executando SQL: ${query}`);
          try {
            // Regra de Segurança: Somente Leitura
            if (query.toLowerCase().match(/insert|update|delete|drop|alter|truncate/)) {
              return "Erro de Segurança: A IA só tem permissão de LEITURA (SELECT).";
            }
            const result = await this.dataSource.query(query);
            return JSON.stringify(result);
          } catch (error) {
            return `Erro SQL: ${error.message}.`;
          }
        },
      });

      const getDatabaseSchemaTool = new DynamicStructuredTool({
        name: 'ver_schema_banco',
        description: 'Retorna a estrutura das tabelas do banco de dados para você montar as queries corretas. É obrigatório consultar isso antes de criar uma SQL.',
        schema: z.object({}),
        func: async () => {
          return `
Tabelas e colunas principais (PostgreSQL/MySQL):
- tb_usuarios: id, nome, email, funcao ('admin', 'func', 'finan', 'gest', 'vend'), ativo (boolean)
- tb_leads: id, title, status, cpf, user_id (id do responsável na tb_usuarios)
- tb_orcamentos: id, valor (decimal), status, lead_id
- tb_empresas: id, razao_social, cnpj
- tb_produtos_servicos: id, nome, valor_padrao

ATENÇÃO: Use sempre os nomes das tabelas com o prefixo 'tb_'. Por exemplo: 'SELECT * FROM tb_usuarios' e NÃO 'SELECT * FROM users'.
          `;
        },
      });

      const tools = [queryDatabaseTool, getDatabaseSchemaTool];

      const systemMessage = new SystemMessage(`Você é um Analista de Dados Avançado e Assistente IA do sistema CRM Ags-Crm.
Se o usuário fizer uma pergunta sobre os dados da empresa (ex: faturamento, melhor vendedor, contagem de leads):
1. USE a ferramenta 'ver_schema_banco' para entender as tabelas disponíveis.
2. USE a ferramenta 'consultar_banco_crm' passando a query SQL exata para extrair as respostas reais.
3. Analise o JSON retornado e responda de forma humanizada, educada e direta.

NUNCA invente números. Sempre consulte o banco.
Formate valores monetários em Reais (R$).
Se não souber responder, diga claramente que não encontrou a informação.`);

      // 2. Criar o Agente com LangGraph
      const agent = createReactAgent({
        llm: this.chatModel,
        tools,
        stateModifier: systemMessage,
      });

      // 3. Executar e processar a resposta
      const response = await agent.invoke({
        messages: [...chatHistory, new HumanMessage(message)],
      });

      return response.messages[response.messages.length - 1].content as string;
    } catch (error) {
      this.logger.error('Erro ao processar Agente LangChain:', error);
      return 'Desculpe, ocorreu uma falha técnica ao acionar as Ferramentas Analíticas do CRM.';
    }
  }
}
