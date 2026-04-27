import { Controller, Get, Delete, Param, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user?.id);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @Get(':id/check-relations')
  async checkRelations(@Param('id') id: string) {
    return this.usersService.checkUserRelations(+id);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    const user = await this.usersService.toggleStatus(+id);
    const { password, ...result } = user;
    return result;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    const user = await this.usersService.update(+id, updateData);
    const { password, ...result } = user;
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
