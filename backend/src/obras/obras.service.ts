
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ObrasService {
  private obras = [
    {
      id: 1,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      ano: 1899,
    },
    {
      id: 2,
      titulo: 'O Pequeno Príncipe',
      autor: 'Antoine de Saint-Exupéry',
      ano: 1943,
    },
    {
      id: 3,
      titulo: 'Capitães da Areia',
      autor: 'Jorge Amado',
      ano: 1937,
    },
  ];

  listar() {
    return this.obras;
  }

  buscarPorId(id: number) {
    const obra = this.obras.find((obra) => obra.id === id);

    if (!obra) {
      throw new NotFoundException('Obra não encontrada');
    }

    return obra;
  }
}

