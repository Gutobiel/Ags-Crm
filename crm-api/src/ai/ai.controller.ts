import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Body('message') message: string, @Request() req) {
    if (!message) {
      return { reply: 'Mensagem inválida.' };
    }
    
    // In later phases we'll pass req.user for specific tool access, 
    // but for now we just reply to the message.
    const reply = await this.aiService.processChatMessage(message);
    
    return { reply };
  }
}
