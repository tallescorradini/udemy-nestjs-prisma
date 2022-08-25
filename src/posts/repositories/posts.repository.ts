import { Injectable } from '@nestjs/common';
import { NotFoundError } from 'src/common/errors/types/NotFoundError';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<PostEntity> {
    const { authorEmail, ...restCreatePostDto } = createPostDto;

    const user = await this.prisma.user.findUnique({
      where: { email: authorEmail },
    });

    if (!user) {
      throw new NotFoundError('Author not found');
    }

    return this.prisma.post.create({
      data: {
        authorId: user.id,
        ...restCreatePostDto,
      },
    });
  }

  async findAll(): Promise<PostEntity[]> {
    return this.prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<PostEntity> {
    return this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const { authorEmail, ...restUpdatePostDto } = updatePostDto;

    if (!authorEmail) {
      return this.prisma.post.update({
        where: {
          id,
        },
        data: updatePostDto,
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: authorEmail,
      },
    });

    if (!user) throw new NotFoundError();

    return this.prisma.post.update({
      where: {
        id,
      },
      data: {
        authorId: user.id,
        ...restUpdatePostDto,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<PostEntity> {
    return this.prisma.post.delete({ where: { id } });
  }
}
