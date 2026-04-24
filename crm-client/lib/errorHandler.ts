export function formatErrorMessage(error: any, defaultMessage: string): string {
  // Se o erro tem uma resposta da API
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Se tem uma mensagem específica
    if (data.message) {
      // Se a mensagem é um array (validação)
      if (Array.isArray(data.message)) {
        return `Erro de validação:\n${data.message.join('\n')}`;
      }
      return data.message;
    }
    
    // Se tem detalhes de validação
    if (data.errors) {
      const errors = Object.entries(data.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('\n');
      return `Campos inválidos:\n${errors}`;
    }
    
    // Se tem status de erro
    if (data.error) {
      return `${data.error}${data.statusCode ? ` (Código: ${data.statusCode})` : ''}`;
    }
  }
  
  // Se é um erro de rede
  if (error?.message === 'Network Error') {
    return 'Erro de conexão. Verifique sua internet ou se o servidor está rodando.';
  }
  
  // Se tem status HTTP
  if (error?.response?.status) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'Dados inválidos. Verifique os campos obrigatórios.';
      case 401:
        return 'Não autorizado. Faça login novamente.';
      case 403:
        return 'Acesso negado. Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Conflito. Este registro já existe ou está em uso.';
      case 422:
        return 'Dados não processáveis. Verifique os campos obrigatórios.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      default:
        return `Erro ${status}: ${defaultMessage}`;
    }
  }
  
  // Mensagem padrão
  return error?.message || defaultMessage;
}
