import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
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

  async processChatMessage(message: string): Promise<string> {
    try {
      this.logger.log(`Processando mensagem do usuário com Agente: ${message}`);

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
        description: 'Retorna a estrutura das tabelas do banco de dados para você montar as queries corretas.',
        schema: z.object({}),
        func: async () => {
          return `
Tabelas e colunas principais:
- user: id, nome, email, funcao (ex: admin, vendedor, consultor)
- lead: id, title, status, cpf, user_id (id do responsável)
- orcamento: id, valor (decimal), status, lead_id
- empresa: id, razao_social, cnpj
          `;
        },
      });

      const tools = [queryDatabaseTool, getDatabaseSchemaTool];

      // 2. Criar o Prompt do Agente
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", `Você é um Analista de Dados Avançado e Assistente IA do sistema CRM Ags-Crm.
Se o usuário fizer uma pergunta sobre os dados da empresa (ex: faturamento, melhor vendedor, contagem de leads):
1. USE a ferramenta 'ver_schema_banco' para entender as tabelas disponíveis.
2. USE a ferramenta 'consultar_banco_crm' passando a query SQL exata para extrair as respostas reais.
3. Analise o JSON retornado e responda de forma humanizada, educada e direta.

NUNCA invente números. Sempre consulte o banco.
Formate valores monetários em Reais (R$).
Se não souber responder, diga claramente que não encontrou a informação.`],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
      ]);

      // 3. Criar o Agente que suporta Tool Calling (Ferramentas)
      const agent = createToolCallingAgent({
        llm: this.chatModel,
        tools,
        prompt,
      });

      const agentExecutor = new AgentExecutor({
        agent,
        tools,
      });

      // 4. Executar e processar a resposta
      const response = await agentExecutor.invoke({
        input: message,
      });

      return response.output;
    } catch (error) {
      this.logger.error('Erro ao processar Agente LangChain:', error);
      return 'Desculpe, ocorreu uma falha técnica ao acionar as Ferramentas Analíticas do CRM.';
    }
  }
}
