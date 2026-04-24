-- Migração Etapa 1 - CRM
-- Data: 23/12/2025

USE geodril;

-- 1. Primeiro, vamos temporariamente transformar etapa em VARCHAR para fazer as atualizações
ALTER TABLE tb_leads 
MODIFY COLUMN etapa VARCHAR(50);

-- 2. Atualizar os dados existentes para os novos valores de etapa
UPDATE tb_leads 
SET etapa = 'orcamento_aprovacao' 
WHERE etapa = 'orcamento';

UPDATE tb_leads 
SET etapa = 'contrato' 
WHERE etapa IN ('faturamento', 'instalacao');

-- 3. Agora modificar a coluna etapa para os novos valores de ENUM
ALTER TABLE tb_leads 
MODIFY COLUMN etapa ENUM(
    'contato_inicial', 
    'negociacao_inicial', 
    'orcamento_aprovacao',
    'negociacao_fechamento', 
    'contrato'
) NOT NULL DEFAULT 'contato_inicial';

-- 4. Modificar a coluna statusNegociacao para adicionar 'arquivado'
ALTER TABLE tb_leads 
MODIFY COLUMN statusNegociacao ENUM(
    'novo', 
    'negociando', 
    'ganho', 
    'perdido', 
    'arquivado'
) NOT NULL DEFAULT 'novo';

-- 5. Transformar servico em VARCHAR primeiro (se for ENUM)
ALTER TABLE tb_leads 
MODIFY COLUMN servico VARCHAR(255) NULL;

-- 6. Modificar a coluna servico para ENUM
ALTER TABLE tb_leads 
MODIFY COLUMN servico ENUM(
    'perfuracao', 
    'limpeza', 
    'montagem_bomba', 
    'pescaria',
    'licencas_outorga', 
    'manutencao_pocos', 
    'manutencao_bombas',
    'teste_vazao', 
    'locacao_geologica', 
    'outros'
) NULL;

-- 7. Transformar origem em VARCHAR primeiro (se for ENUM)
ALTER TABLE tb_leads 
MODIFY COLUMN origem VARCHAR(100) NULL;

-- 8. Modificar a coluna origem para ENUM
ALTER TABLE tb_leads 
MODIFY COLUMN origem ENUM(
    'marketing_instagram', 
    'marketing_facebook', 
    'site',
    'indicacao', 
    'presencial', 
    'google', 
    'outros'
) NULL;

-- Verificar a estrutura atual antes de adicionar novas colunas
-- DESCRIBE tb_leads;

-- 9. Tentar adicionar tagNegociacao (ignorar erro se já existir)
-- Para evitar erros, execute manualmente se necessário


-- Verificar a estrutura da tabela
DESCRIBE tb_leads;

-- Verificar os dados
SELECT id, etapa, statusNegociacao, servico, origem, tagNegociacao 
FROM tb_leads 
LIMIT 5;
