import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @FieldResolver(() => User)
    creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { updootLoader, req }: MyContext
    ) {
        if (!req.session.userId) {
            return;
        }
        const updoot = await updootLoader.load({
            postId: post.id,
            userId: req.session.userId,
        });
        return updoot ? updoot.value : null;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpDoot = value !== -1;
        const _value = isUpDoot ? 1 : -1;
        const { userId } = req.session;

        const updoot = await Updoot.findOne({ where: { postId, userId } });

        if (updoot && updoot.value !== _value) {
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `            
                        update updoot
                        set value = $1
                        where "postId" = $2 and "userId" = $3
                    `,
                    [_value, postId, userId]
                );
                await tm.query(
                    `            
                        update post
                        set points = points + $1
                        where id = $2
                    `,
                    [2 * _value, postId]
                );
            });
        } else if (!updoot) {
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `            
                        insert into updoot ("userId", "postId", value)
                        values($1,$2,$3)
                    `,
                    [userId, postId, _value]
                );
                await tm.query(
                    `            
                        update post
                        set points = points + $1
                        where id = $2
                    `,
                    [_value, postId]
                );
            });
        }

        // await getConnection().query(
        //     `
        //     START TRANSACTION;

        //     insert into updoot ("userId", "postId", value)
        //     values(${userId},${postId},${_value});

        //     update post
        //     set points = points + ${_value}
        //     where id = ${postId};

        //     COMMIT;
        // `
        // );
        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string
    ): Promise<PaginatedPosts> {
        const reallimit = Math.min(50, limit);
        const reallimitPlusOne = Math.min(50, limit) + 1;

        const replacements: any[] = [reallimitPlusOne];

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await getConnection().query(
            `
            select p.*
            from post p
            ${cursor ? `where p."createdAt" < $2  ` : ''}
            order by p."createdAt" DESC
            limit $1
        `,
            replacements
        );

        return {
            posts: posts.slice(0, reallimit),
            hasMore: posts.length === reallimitPlusOne,
        };
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId,
        }).save();
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const post = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
            .returning('*')
            .execute();
        return post.raw[0];
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        // Not Cascade way
        // const post = await Post.findOne(id);
        // if (!post) {
        //     return false;
        // }
        // if (post.creatorId !== req.session.userId) {
        //     throw new Error('not authorized');
        // }
        // await Updoot.delete({ postId: id });
        // await Post.delete({ id });

        // Cascade way
        await Post.delete({ id, creatorId: req.session.userId });
        return true;
    }
}
