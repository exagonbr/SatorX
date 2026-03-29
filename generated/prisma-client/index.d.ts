
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model TdLearning
 * 
 */
export type TdLearning = $Result.DefaultSelection<Prisma.$TdLearningPayload>
/**
 * Model NnWeightsSnapshot
 * 
 */
export type NnWeightsSnapshot = $Result.DefaultSelection<Prisma.$NnWeightsSnapshotPayload>
/**
 * Model GameReplay
 * Partida salva (replays) — fonte para o buffer de posições.
 */
export type GameReplay = $Result.DefaultSelection<Prisma.$GameReplayPayload>
/**
 * Model ReplayBufferRow
 * Posições derivadas dos replays (amostragem para train-buffer).
 */
export type ReplayBufferRow = $Result.DefaultSelection<Prisma.$ReplayBufferRowPayload>
/**
 * Model LobbyRanking
 * Histórico de partidas multijogador (lobby) para ranking na UI.
 */
export type LobbyRanking = $Result.DefaultSelection<Prisma.$LobbyRankingPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more TdLearnings
 * const tdLearnings = await prisma.tdLearning.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more TdLearnings
   * const tdLearnings = await prisma.tdLearning.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.tdLearning`: Exposes CRUD operations for the **TdLearning** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TdLearnings
    * const tdLearnings = await prisma.tdLearning.findMany()
    * ```
    */
  get tdLearning(): Prisma.TdLearningDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.nnWeightsSnapshot`: Exposes CRUD operations for the **NnWeightsSnapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NnWeightsSnapshots
    * const nnWeightsSnapshots = await prisma.nnWeightsSnapshot.findMany()
    * ```
    */
  get nnWeightsSnapshot(): Prisma.NnWeightsSnapshotDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gameReplay`: Exposes CRUD operations for the **GameReplay** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameReplays
    * const gameReplays = await prisma.gameReplay.findMany()
    * ```
    */
  get gameReplay(): Prisma.GameReplayDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.replayBufferRow`: Exposes CRUD operations for the **ReplayBufferRow** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReplayBufferRows
    * const replayBufferRows = await prisma.replayBufferRow.findMany()
    * ```
    */
  get replayBufferRow(): Prisma.ReplayBufferRowDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lobbyRanking`: Exposes CRUD operations for the **LobbyRanking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LobbyRankings
    * const lobbyRankings = await prisma.lobbyRanking.findMany()
    * ```
    */
  get lobbyRanking(): Prisma.LobbyRankingDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    TdLearning: 'TdLearning',
    NnWeightsSnapshot: 'NnWeightsSnapshot',
    GameReplay: 'GameReplay',
    ReplayBufferRow: 'ReplayBufferRow',
    LobbyRanking: 'LobbyRanking'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tdLearning" | "nnWeightsSnapshot" | "gameReplay" | "replayBufferRow" | "lobbyRanking"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      TdLearning: {
        payload: Prisma.$TdLearningPayload<ExtArgs>
        fields: Prisma.TdLearningFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TdLearningFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TdLearningFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>
          }
          findFirst: {
            args: Prisma.TdLearningFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TdLearningFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>
          }
          findMany: {
            args: Prisma.TdLearningFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>[]
          }
          create: {
            args: Prisma.TdLearningCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>
          }
          createMany: {
            args: Prisma.TdLearningCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TdLearningCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>[]
          }
          delete: {
            args: Prisma.TdLearningDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>
          }
          update: {
            args: Prisma.TdLearningUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>
          }
          deleteMany: {
            args: Prisma.TdLearningDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TdLearningUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TdLearningUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>[]
          }
          upsert: {
            args: Prisma.TdLearningUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TdLearningPayload>
          }
          aggregate: {
            args: Prisma.TdLearningAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTdLearning>
          }
          groupBy: {
            args: Prisma.TdLearningGroupByArgs<ExtArgs>
            result: $Utils.Optional<TdLearningGroupByOutputType>[]
          }
          count: {
            args: Prisma.TdLearningCountArgs<ExtArgs>
            result: $Utils.Optional<TdLearningCountAggregateOutputType> | number
          }
        }
      }
      NnWeightsSnapshot: {
        payload: Prisma.$NnWeightsSnapshotPayload<ExtArgs>
        fields: Prisma.NnWeightsSnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NnWeightsSnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NnWeightsSnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>
          }
          findFirst: {
            args: Prisma.NnWeightsSnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NnWeightsSnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>
          }
          findMany: {
            args: Prisma.NnWeightsSnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>[]
          }
          create: {
            args: Prisma.NnWeightsSnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>
          }
          createMany: {
            args: Prisma.NnWeightsSnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NnWeightsSnapshotCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>[]
          }
          delete: {
            args: Prisma.NnWeightsSnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>
          }
          update: {
            args: Prisma.NnWeightsSnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>
          }
          deleteMany: {
            args: Prisma.NnWeightsSnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NnWeightsSnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NnWeightsSnapshotUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>[]
          }
          upsert: {
            args: Prisma.NnWeightsSnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NnWeightsSnapshotPayload>
          }
          aggregate: {
            args: Prisma.NnWeightsSnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNnWeightsSnapshot>
          }
          groupBy: {
            args: Prisma.NnWeightsSnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<NnWeightsSnapshotGroupByOutputType>[]
          }
          count: {
            args: Prisma.NnWeightsSnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<NnWeightsSnapshotCountAggregateOutputType> | number
          }
        }
      }
      GameReplay: {
        payload: Prisma.$GameReplayPayload<ExtArgs>
        fields: Prisma.GameReplayFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameReplayFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameReplayFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>
          }
          findFirst: {
            args: Prisma.GameReplayFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameReplayFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>
          }
          findMany: {
            args: Prisma.GameReplayFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>[]
          }
          create: {
            args: Prisma.GameReplayCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>
          }
          createMany: {
            args: Prisma.GameReplayCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GameReplayCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>[]
          }
          delete: {
            args: Prisma.GameReplayDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>
          }
          update: {
            args: Prisma.GameReplayUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>
          }
          deleteMany: {
            args: Prisma.GameReplayDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameReplayUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GameReplayUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>[]
          }
          upsert: {
            args: Prisma.GameReplayUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameReplayPayload>
          }
          aggregate: {
            args: Prisma.GameReplayAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameReplay>
          }
          groupBy: {
            args: Prisma.GameReplayGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameReplayGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameReplayCountArgs<ExtArgs>
            result: $Utils.Optional<GameReplayCountAggregateOutputType> | number
          }
        }
      }
      ReplayBufferRow: {
        payload: Prisma.$ReplayBufferRowPayload<ExtArgs>
        fields: Prisma.ReplayBufferRowFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReplayBufferRowFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReplayBufferRowFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>
          }
          findFirst: {
            args: Prisma.ReplayBufferRowFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReplayBufferRowFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>
          }
          findMany: {
            args: Prisma.ReplayBufferRowFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>[]
          }
          create: {
            args: Prisma.ReplayBufferRowCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>
          }
          createMany: {
            args: Prisma.ReplayBufferRowCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReplayBufferRowCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>[]
          }
          delete: {
            args: Prisma.ReplayBufferRowDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>
          }
          update: {
            args: Prisma.ReplayBufferRowUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>
          }
          deleteMany: {
            args: Prisma.ReplayBufferRowDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReplayBufferRowUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReplayBufferRowUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>[]
          }
          upsert: {
            args: Prisma.ReplayBufferRowUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReplayBufferRowPayload>
          }
          aggregate: {
            args: Prisma.ReplayBufferRowAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReplayBufferRow>
          }
          groupBy: {
            args: Prisma.ReplayBufferRowGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReplayBufferRowGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReplayBufferRowCountArgs<ExtArgs>
            result: $Utils.Optional<ReplayBufferRowCountAggregateOutputType> | number
          }
        }
      }
      LobbyRanking: {
        payload: Prisma.$LobbyRankingPayload<ExtArgs>
        fields: Prisma.LobbyRankingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LobbyRankingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LobbyRankingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>
          }
          findFirst: {
            args: Prisma.LobbyRankingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LobbyRankingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>
          }
          findMany: {
            args: Prisma.LobbyRankingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>[]
          }
          create: {
            args: Prisma.LobbyRankingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>
          }
          createMany: {
            args: Prisma.LobbyRankingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LobbyRankingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>[]
          }
          delete: {
            args: Prisma.LobbyRankingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>
          }
          update: {
            args: Prisma.LobbyRankingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>
          }
          deleteMany: {
            args: Prisma.LobbyRankingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LobbyRankingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LobbyRankingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>[]
          }
          upsert: {
            args: Prisma.LobbyRankingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LobbyRankingPayload>
          }
          aggregate: {
            args: Prisma.LobbyRankingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLobbyRanking>
          }
          groupBy: {
            args: Prisma.LobbyRankingGroupByArgs<ExtArgs>
            result: $Utils.Optional<LobbyRankingGroupByOutputType>[]
          }
          count: {
            args: Prisma.LobbyRankingCountArgs<ExtArgs>
            result: $Utils.Optional<LobbyRankingCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    tdLearning?: TdLearningOmit
    nnWeightsSnapshot?: NnWeightsSnapshotOmit
    gameReplay?: GameReplayOmit
    replayBufferRow?: ReplayBufferRowOmit
    lobbyRanking?: LobbyRankingOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type GameReplayCountOutputType
   */

  export type GameReplayCountOutputType = {
    bufferRows: number
  }

  export type GameReplayCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bufferRows?: boolean | GameReplayCountOutputTypeCountBufferRowsArgs
  }

  // Custom InputTypes
  /**
   * GameReplayCountOutputType without action
   */
  export type GameReplayCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplayCountOutputType
     */
    select?: GameReplayCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GameReplayCountOutputType without action
   */
  export type GameReplayCountOutputTypeCountBufferRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReplayBufferRowWhereInput
  }


  /**
   * Models
   */

  /**
   * Model TdLearning
   */

  export type AggregateTdLearning = {
    _count: TdLearningCountAggregateOutputType | null
    _avg: TdLearningAvgAggregateOutputType | null
    _sum: TdLearningSumAggregateOutputType | null
    _min: TdLearningMinAggregateOutputType | null
    _max: TdLearningMaxAggregateOutputType | null
  }

  export type TdLearningAvgAggregateOutputType = {
    id: number | null
    tdError: number | null
    vBefore: number | null
    vAfter: number | null
    tdTarget: number | null
    terminal: number | null
    outcomeForMover: number | null
    updates: number | null
  }

  export type TdLearningSumAggregateOutputType = {
    id: number | null
    tdError: number | null
    vBefore: number | null
    vAfter: number | null
    tdTarget: number | null
    terminal: number | null
    outcomeForMover: number | null
    updates: number | null
  }

  export type TdLearningMinAggregateOutputType = {
    id: number | null
    createdAt: string | null
    tdError: number | null
    vBefore: number | null
    vAfter: number | null
    tdTarget: number | null
    terminal: number | null
    outcomeForMover: number | null
    updates: number | null
  }

  export type TdLearningMaxAggregateOutputType = {
    id: number | null
    createdAt: string | null
    tdError: number | null
    vBefore: number | null
    vAfter: number | null
    tdTarget: number | null
    terminal: number | null
    outcomeForMover: number | null
    updates: number | null
  }

  export type TdLearningCountAggregateOutputType = {
    id: number
    createdAt: number
    tdError: number
    vBefore: number
    vAfter: number
    tdTarget: number
    terminal: number
    outcomeForMover: number
    updates: number
    _all: number
  }


  export type TdLearningAvgAggregateInputType = {
    id?: true
    tdError?: true
    vBefore?: true
    vAfter?: true
    tdTarget?: true
    terminal?: true
    outcomeForMover?: true
    updates?: true
  }

  export type TdLearningSumAggregateInputType = {
    id?: true
    tdError?: true
    vBefore?: true
    vAfter?: true
    tdTarget?: true
    terminal?: true
    outcomeForMover?: true
    updates?: true
  }

  export type TdLearningMinAggregateInputType = {
    id?: true
    createdAt?: true
    tdError?: true
    vBefore?: true
    vAfter?: true
    tdTarget?: true
    terminal?: true
    outcomeForMover?: true
    updates?: true
  }

  export type TdLearningMaxAggregateInputType = {
    id?: true
    createdAt?: true
    tdError?: true
    vBefore?: true
    vAfter?: true
    tdTarget?: true
    terminal?: true
    outcomeForMover?: true
    updates?: true
  }

  export type TdLearningCountAggregateInputType = {
    id?: true
    createdAt?: true
    tdError?: true
    vBefore?: true
    vAfter?: true
    tdTarget?: true
    terminal?: true
    outcomeForMover?: true
    updates?: true
    _all?: true
  }

  export type TdLearningAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TdLearning to aggregate.
     */
    where?: TdLearningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TdLearnings to fetch.
     */
    orderBy?: TdLearningOrderByWithRelationInput | TdLearningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TdLearningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TdLearnings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TdLearnings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TdLearnings
    **/
    _count?: true | TdLearningCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TdLearningAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TdLearningSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TdLearningMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TdLearningMaxAggregateInputType
  }

  export type GetTdLearningAggregateType<T extends TdLearningAggregateArgs> = {
        [P in keyof T & keyof AggregateTdLearning]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTdLearning[P]>
      : GetScalarType<T[P], AggregateTdLearning[P]>
  }




  export type TdLearningGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TdLearningWhereInput
    orderBy?: TdLearningOrderByWithAggregationInput | TdLearningOrderByWithAggregationInput[]
    by: TdLearningScalarFieldEnum[] | TdLearningScalarFieldEnum
    having?: TdLearningScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TdLearningCountAggregateInputType | true
    _avg?: TdLearningAvgAggregateInputType
    _sum?: TdLearningSumAggregateInputType
    _min?: TdLearningMinAggregateInputType
    _max?: TdLearningMaxAggregateInputType
  }

  export type TdLearningGroupByOutputType = {
    id: number
    createdAt: string
    tdError: number | null
    vBefore: number | null
    vAfter: number | null
    tdTarget: number | null
    terminal: number
    outcomeForMover: number
    updates: number
    _count: TdLearningCountAggregateOutputType | null
    _avg: TdLearningAvgAggregateOutputType | null
    _sum: TdLearningSumAggregateOutputType | null
    _min: TdLearningMinAggregateOutputType | null
    _max: TdLearningMaxAggregateOutputType | null
  }

  type GetTdLearningGroupByPayload<T extends TdLearningGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TdLearningGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TdLearningGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TdLearningGroupByOutputType[P]>
            : GetScalarType<T[P], TdLearningGroupByOutputType[P]>
        }
      >
    >


  export type TdLearningSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    tdError?: boolean
    vBefore?: boolean
    vAfter?: boolean
    tdTarget?: boolean
    terminal?: boolean
    outcomeForMover?: boolean
    updates?: boolean
  }, ExtArgs["result"]["tdLearning"]>

  export type TdLearningSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    tdError?: boolean
    vBefore?: boolean
    vAfter?: boolean
    tdTarget?: boolean
    terminal?: boolean
    outcomeForMover?: boolean
    updates?: boolean
  }, ExtArgs["result"]["tdLearning"]>

  export type TdLearningSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    tdError?: boolean
    vBefore?: boolean
    vAfter?: boolean
    tdTarget?: boolean
    terminal?: boolean
    outcomeForMover?: boolean
    updates?: boolean
  }, ExtArgs["result"]["tdLearning"]>

  export type TdLearningSelectScalar = {
    id?: boolean
    createdAt?: boolean
    tdError?: boolean
    vBefore?: boolean
    vAfter?: boolean
    tdTarget?: boolean
    terminal?: boolean
    outcomeForMover?: boolean
    updates?: boolean
  }

  export type TdLearningOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "tdError" | "vBefore" | "vAfter" | "tdTarget" | "terminal" | "outcomeForMover" | "updates", ExtArgs["result"]["tdLearning"]>

  export type $TdLearningPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TdLearning"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: string
      tdError: number | null
      vBefore: number | null
      vAfter: number | null
      tdTarget: number | null
      terminal: number
      outcomeForMover: number
      updates: number
    }, ExtArgs["result"]["tdLearning"]>
    composites: {}
  }

  type TdLearningGetPayload<S extends boolean | null | undefined | TdLearningDefaultArgs> = $Result.GetResult<Prisma.$TdLearningPayload, S>

  type TdLearningCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TdLearningFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TdLearningCountAggregateInputType | true
    }

  export interface TdLearningDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TdLearning'], meta: { name: 'TdLearning' } }
    /**
     * Find zero or one TdLearning that matches the filter.
     * @param {TdLearningFindUniqueArgs} args - Arguments to find a TdLearning
     * @example
     * // Get one TdLearning
     * const tdLearning = await prisma.tdLearning.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TdLearningFindUniqueArgs>(args: SelectSubset<T, TdLearningFindUniqueArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TdLearning that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TdLearningFindUniqueOrThrowArgs} args - Arguments to find a TdLearning
     * @example
     * // Get one TdLearning
     * const tdLearning = await prisma.tdLearning.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TdLearningFindUniqueOrThrowArgs>(args: SelectSubset<T, TdLearningFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TdLearning that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TdLearningFindFirstArgs} args - Arguments to find a TdLearning
     * @example
     * // Get one TdLearning
     * const tdLearning = await prisma.tdLearning.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TdLearningFindFirstArgs>(args?: SelectSubset<T, TdLearningFindFirstArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TdLearning that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TdLearningFindFirstOrThrowArgs} args - Arguments to find a TdLearning
     * @example
     * // Get one TdLearning
     * const tdLearning = await prisma.tdLearning.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TdLearningFindFirstOrThrowArgs>(args?: SelectSubset<T, TdLearningFindFirstOrThrowArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TdLearnings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TdLearningFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TdLearnings
     * const tdLearnings = await prisma.tdLearning.findMany()
     * 
     * // Get first 10 TdLearnings
     * const tdLearnings = await prisma.tdLearning.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tdLearningWithIdOnly = await prisma.tdLearning.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TdLearningFindManyArgs>(args?: SelectSubset<T, TdLearningFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TdLearning.
     * @param {TdLearningCreateArgs} args - Arguments to create a TdLearning.
     * @example
     * // Create one TdLearning
     * const TdLearning = await prisma.tdLearning.create({
     *   data: {
     *     // ... data to create a TdLearning
     *   }
     * })
     * 
     */
    create<T extends TdLearningCreateArgs>(args: SelectSubset<T, TdLearningCreateArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TdLearnings.
     * @param {TdLearningCreateManyArgs} args - Arguments to create many TdLearnings.
     * @example
     * // Create many TdLearnings
     * const tdLearning = await prisma.tdLearning.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TdLearningCreateManyArgs>(args?: SelectSubset<T, TdLearningCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TdLearnings and returns the data saved in the database.
     * @param {TdLearningCreateManyAndReturnArgs} args - Arguments to create many TdLearnings.
     * @example
     * // Create many TdLearnings
     * const tdLearning = await prisma.tdLearning.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TdLearnings and only return the `id`
     * const tdLearningWithIdOnly = await prisma.tdLearning.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TdLearningCreateManyAndReturnArgs>(args?: SelectSubset<T, TdLearningCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TdLearning.
     * @param {TdLearningDeleteArgs} args - Arguments to delete one TdLearning.
     * @example
     * // Delete one TdLearning
     * const TdLearning = await prisma.tdLearning.delete({
     *   where: {
     *     // ... filter to delete one TdLearning
     *   }
     * })
     * 
     */
    delete<T extends TdLearningDeleteArgs>(args: SelectSubset<T, TdLearningDeleteArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TdLearning.
     * @param {TdLearningUpdateArgs} args - Arguments to update one TdLearning.
     * @example
     * // Update one TdLearning
     * const tdLearning = await prisma.tdLearning.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TdLearningUpdateArgs>(args: SelectSubset<T, TdLearningUpdateArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TdLearnings.
     * @param {TdLearningDeleteManyArgs} args - Arguments to filter TdLearnings to delete.
     * @example
     * // Delete a few TdLearnings
     * const { count } = await prisma.tdLearning.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TdLearningDeleteManyArgs>(args?: SelectSubset<T, TdLearningDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TdLearnings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TdLearningUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TdLearnings
     * const tdLearning = await prisma.tdLearning.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TdLearningUpdateManyArgs>(args: SelectSubset<T, TdLearningUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TdLearnings and returns the data updated in the database.
     * @param {TdLearningUpdateManyAndReturnArgs} args - Arguments to update many TdLearnings.
     * @example
     * // Update many TdLearnings
     * const tdLearning = await prisma.tdLearning.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TdLearnings and only return the `id`
     * const tdLearningWithIdOnly = await prisma.tdLearning.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TdLearningUpdateManyAndReturnArgs>(args: SelectSubset<T, TdLearningUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TdLearning.
     * @param {TdLearningUpsertArgs} args - Arguments to update or create a TdLearning.
     * @example
     * // Update or create a TdLearning
     * const tdLearning = await prisma.tdLearning.upsert({
     *   create: {
     *     // ... data to create a TdLearning
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TdLearning we want to update
     *   }
     * })
     */
    upsert<T extends TdLearningUpsertArgs>(args: SelectSubset<T, TdLearningUpsertArgs<ExtArgs>>): Prisma__TdLearningClient<$Result.GetResult<Prisma.$TdLearningPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TdLearnings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TdLearningCountArgs} args - Arguments to filter TdLearnings to count.
     * @example
     * // Count the number of TdLearnings
     * const count = await prisma.tdLearning.count({
     *   where: {
     *     // ... the filter for the TdLearnings we want to count
     *   }
     * })
    **/
    count<T extends TdLearningCountArgs>(
      args?: Subset<T, TdLearningCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TdLearningCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TdLearning.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TdLearningAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TdLearningAggregateArgs>(args: Subset<T, TdLearningAggregateArgs>): Prisma.PrismaPromise<GetTdLearningAggregateType<T>>

    /**
     * Group by TdLearning.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TdLearningGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TdLearningGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TdLearningGroupByArgs['orderBy'] }
        : { orderBy?: TdLearningGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TdLearningGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTdLearningGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TdLearning model
   */
  readonly fields: TdLearningFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TdLearning.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TdLearningClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TdLearning model
   */
  interface TdLearningFieldRefs {
    readonly id: FieldRef<"TdLearning", 'Int'>
    readonly createdAt: FieldRef<"TdLearning", 'String'>
    readonly tdError: FieldRef<"TdLearning", 'Float'>
    readonly vBefore: FieldRef<"TdLearning", 'Float'>
    readonly vAfter: FieldRef<"TdLearning", 'Float'>
    readonly tdTarget: FieldRef<"TdLearning", 'Float'>
    readonly terminal: FieldRef<"TdLearning", 'Int'>
    readonly outcomeForMover: FieldRef<"TdLearning", 'Int'>
    readonly updates: FieldRef<"TdLearning", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * TdLearning findUnique
   */
  export type TdLearningFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * Filter, which TdLearning to fetch.
     */
    where: TdLearningWhereUniqueInput
  }

  /**
   * TdLearning findUniqueOrThrow
   */
  export type TdLearningFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * Filter, which TdLearning to fetch.
     */
    where: TdLearningWhereUniqueInput
  }

  /**
   * TdLearning findFirst
   */
  export type TdLearningFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * Filter, which TdLearning to fetch.
     */
    where?: TdLearningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TdLearnings to fetch.
     */
    orderBy?: TdLearningOrderByWithRelationInput | TdLearningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TdLearnings.
     */
    cursor?: TdLearningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TdLearnings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TdLearnings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TdLearnings.
     */
    distinct?: TdLearningScalarFieldEnum | TdLearningScalarFieldEnum[]
  }

  /**
   * TdLearning findFirstOrThrow
   */
  export type TdLearningFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * Filter, which TdLearning to fetch.
     */
    where?: TdLearningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TdLearnings to fetch.
     */
    orderBy?: TdLearningOrderByWithRelationInput | TdLearningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TdLearnings.
     */
    cursor?: TdLearningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TdLearnings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TdLearnings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TdLearnings.
     */
    distinct?: TdLearningScalarFieldEnum | TdLearningScalarFieldEnum[]
  }

  /**
   * TdLearning findMany
   */
  export type TdLearningFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * Filter, which TdLearnings to fetch.
     */
    where?: TdLearningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TdLearnings to fetch.
     */
    orderBy?: TdLearningOrderByWithRelationInput | TdLearningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TdLearnings.
     */
    cursor?: TdLearningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TdLearnings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TdLearnings.
     */
    skip?: number
    distinct?: TdLearningScalarFieldEnum | TdLearningScalarFieldEnum[]
  }

  /**
   * TdLearning create
   */
  export type TdLearningCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * The data needed to create a TdLearning.
     */
    data: XOR<TdLearningCreateInput, TdLearningUncheckedCreateInput>
  }

  /**
   * TdLearning createMany
   */
  export type TdLearningCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TdLearnings.
     */
    data: TdLearningCreateManyInput | TdLearningCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TdLearning createManyAndReturn
   */
  export type TdLearningCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * The data used to create many TdLearnings.
     */
    data: TdLearningCreateManyInput | TdLearningCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TdLearning update
   */
  export type TdLearningUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * The data needed to update a TdLearning.
     */
    data: XOR<TdLearningUpdateInput, TdLearningUncheckedUpdateInput>
    /**
     * Choose, which TdLearning to update.
     */
    where: TdLearningWhereUniqueInput
  }

  /**
   * TdLearning updateMany
   */
  export type TdLearningUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TdLearnings.
     */
    data: XOR<TdLearningUpdateManyMutationInput, TdLearningUncheckedUpdateManyInput>
    /**
     * Filter which TdLearnings to update
     */
    where?: TdLearningWhereInput
    /**
     * Limit how many TdLearnings to update.
     */
    limit?: number
  }

  /**
   * TdLearning updateManyAndReturn
   */
  export type TdLearningUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * The data used to update TdLearnings.
     */
    data: XOR<TdLearningUpdateManyMutationInput, TdLearningUncheckedUpdateManyInput>
    /**
     * Filter which TdLearnings to update
     */
    where?: TdLearningWhereInput
    /**
     * Limit how many TdLearnings to update.
     */
    limit?: number
  }

  /**
   * TdLearning upsert
   */
  export type TdLearningUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * The filter to search for the TdLearning to update in case it exists.
     */
    where: TdLearningWhereUniqueInput
    /**
     * In case the TdLearning found by the `where` argument doesn't exist, create a new TdLearning with this data.
     */
    create: XOR<TdLearningCreateInput, TdLearningUncheckedCreateInput>
    /**
     * In case the TdLearning was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TdLearningUpdateInput, TdLearningUncheckedUpdateInput>
  }

  /**
   * TdLearning delete
   */
  export type TdLearningDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
    /**
     * Filter which TdLearning to delete.
     */
    where: TdLearningWhereUniqueInput
  }

  /**
   * TdLearning deleteMany
   */
  export type TdLearningDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TdLearnings to delete
     */
    where?: TdLearningWhereInput
    /**
     * Limit how many TdLearnings to delete.
     */
    limit?: number
  }

  /**
   * TdLearning without action
   */
  export type TdLearningDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TdLearning
     */
    select?: TdLearningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TdLearning
     */
    omit?: TdLearningOmit<ExtArgs> | null
  }


  /**
   * Model NnWeightsSnapshot
   */

  export type AggregateNnWeightsSnapshot = {
    _count: NnWeightsSnapshotCountAggregateOutputType | null
    _avg: NnWeightsSnapshotAvgAggregateOutputType | null
    _sum: NnWeightsSnapshotSumAggregateOutputType | null
    _min: NnWeightsSnapshotMinAggregateOutputType | null
    _max: NnWeightsSnapshotMaxAggregateOutputType | null
  }

  export type NnWeightsSnapshotAvgAggregateOutputType = {
    id: number | null
    updates: number | null
  }

  export type NnWeightsSnapshotSumAggregateOutputType = {
    id: number | null
    updates: number | null
  }

  export type NnWeightsSnapshotMinAggregateOutputType = {
    id: number | null
    createdAt: string | null
    updates: number | null
    payload: string | null
  }

  export type NnWeightsSnapshotMaxAggregateOutputType = {
    id: number | null
    createdAt: string | null
    updates: number | null
    payload: string | null
  }

  export type NnWeightsSnapshotCountAggregateOutputType = {
    id: number
    createdAt: number
    updates: number
    payload: number
    _all: number
  }


  export type NnWeightsSnapshotAvgAggregateInputType = {
    id?: true
    updates?: true
  }

  export type NnWeightsSnapshotSumAggregateInputType = {
    id?: true
    updates?: true
  }

  export type NnWeightsSnapshotMinAggregateInputType = {
    id?: true
    createdAt?: true
    updates?: true
    payload?: true
  }

  export type NnWeightsSnapshotMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updates?: true
    payload?: true
  }

  export type NnWeightsSnapshotCountAggregateInputType = {
    id?: true
    createdAt?: true
    updates?: true
    payload?: true
    _all?: true
  }

  export type NnWeightsSnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NnWeightsSnapshot to aggregate.
     */
    where?: NnWeightsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NnWeightsSnapshots to fetch.
     */
    orderBy?: NnWeightsSnapshotOrderByWithRelationInput | NnWeightsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NnWeightsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NnWeightsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NnWeightsSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NnWeightsSnapshots
    **/
    _count?: true | NnWeightsSnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NnWeightsSnapshotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NnWeightsSnapshotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NnWeightsSnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NnWeightsSnapshotMaxAggregateInputType
  }

  export type GetNnWeightsSnapshotAggregateType<T extends NnWeightsSnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregateNnWeightsSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNnWeightsSnapshot[P]>
      : GetScalarType<T[P], AggregateNnWeightsSnapshot[P]>
  }




  export type NnWeightsSnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NnWeightsSnapshotWhereInput
    orderBy?: NnWeightsSnapshotOrderByWithAggregationInput | NnWeightsSnapshotOrderByWithAggregationInput[]
    by: NnWeightsSnapshotScalarFieldEnum[] | NnWeightsSnapshotScalarFieldEnum
    having?: NnWeightsSnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NnWeightsSnapshotCountAggregateInputType | true
    _avg?: NnWeightsSnapshotAvgAggregateInputType
    _sum?: NnWeightsSnapshotSumAggregateInputType
    _min?: NnWeightsSnapshotMinAggregateInputType
    _max?: NnWeightsSnapshotMaxAggregateInputType
  }

  export type NnWeightsSnapshotGroupByOutputType = {
    id: number
    createdAt: string
    updates: number
    payload: string
    _count: NnWeightsSnapshotCountAggregateOutputType | null
    _avg: NnWeightsSnapshotAvgAggregateOutputType | null
    _sum: NnWeightsSnapshotSumAggregateOutputType | null
    _min: NnWeightsSnapshotMinAggregateOutputType | null
    _max: NnWeightsSnapshotMaxAggregateOutputType | null
  }

  type GetNnWeightsSnapshotGroupByPayload<T extends NnWeightsSnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NnWeightsSnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NnWeightsSnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NnWeightsSnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], NnWeightsSnapshotGroupByOutputType[P]>
        }
      >
    >


  export type NnWeightsSnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updates?: boolean
    payload?: boolean
  }, ExtArgs["result"]["nnWeightsSnapshot"]>

  export type NnWeightsSnapshotSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updates?: boolean
    payload?: boolean
  }, ExtArgs["result"]["nnWeightsSnapshot"]>

  export type NnWeightsSnapshotSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updates?: boolean
    payload?: boolean
  }, ExtArgs["result"]["nnWeightsSnapshot"]>

  export type NnWeightsSnapshotSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updates?: boolean
    payload?: boolean
  }

  export type NnWeightsSnapshotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updates" | "payload", ExtArgs["result"]["nnWeightsSnapshot"]>

  export type $NnWeightsSnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NnWeightsSnapshot"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: string
      updates: number
      payload: string
    }, ExtArgs["result"]["nnWeightsSnapshot"]>
    composites: {}
  }

  type NnWeightsSnapshotGetPayload<S extends boolean | null | undefined | NnWeightsSnapshotDefaultArgs> = $Result.GetResult<Prisma.$NnWeightsSnapshotPayload, S>

  type NnWeightsSnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NnWeightsSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NnWeightsSnapshotCountAggregateInputType | true
    }

  export interface NnWeightsSnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NnWeightsSnapshot'], meta: { name: 'NnWeightsSnapshot' } }
    /**
     * Find zero or one NnWeightsSnapshot that matches the filter.
     * @param {NnWeightsSnapshotFindUniqueArgs} args - Arguments to find a NnWeightsSnapshot
     * @example
     * // Get one NnWeightsSnapshot
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NnWeightsSnapshotFindUniqueArgs>(args: SelectSubset<T, NnWeightsSnapshotFindUniqueArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NnWeightsSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NnWeightsSnapshotFindUniqueOrThrowArgs} args - Arguments to find a NnWeightsSnapshot
     * @example
     * // Get one NnWeightsSnapshot
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NnWeightsSnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, NnWeightsSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NnWeightsSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NnWeightsSnapshotFindFirstArgs} args - Arguments to find a NnWeightsSnapshot
     * @example
     * // Get one NnWeightsSnapshot
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NnWeightsSnapshotFindFirstArgs>(args?: SelectSubset<T, NnWeightsSnapshotFindFirstArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NnWeightsSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NnWeightsSnapshotFindFirstOrThrowArgs} args - Arguments to find a NnWeightsSnapshot
     * @example
     * // Get one NnWeightsSnapshot
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NnWeightsSnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, NnWeightsSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NnWeightsSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NnWeightsSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NnWeightsSnapshots
     * const nnWeightsSnapshots = await prisma.nnWeightsSnapshot.findMany()
     * 
     * // Get first 10 NnWeightsSnapshots
     * const nnWeightsSnapshots = await prisma.nnWeightsSnapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const nnWeightsSnapshotWithIdOnly = await prisma.nnWeightsSnapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NnWeightsSnapshotFindManyArgs>(args?: SelectSubset<T, NnWeightsSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NnWeightsSnapshot.
     * @param {NnWeightsSnapshotCreateArgs} args - Arguments to create a NnWeightsSnapshot.
     * @example
     * // Create one NnWeightsSnapshot
     * const NnWeightsSnapshot = await prisma.nnWeightsSnapshot.create({
     *   data: {
     *     // ... data to create a NnWeightsSnapshot
     *   }
     * })
     * 
     */
    create<T extends NnWeightsSnapshotCreateArgs>(args: SelectSubset<T, NnWeightsSnapshotCreateArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NnWeightsSnapshots.
     * @param {NnWeightsSnapshotCreateManyArgs} args - Arguments to create many NnWeightsSnapshots.
     * @example
     * // Create many NnWeightsSnapshots
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NnWeightsSnapshotCreateManyArgs>(args?: SelectSubset<T, NnWeightsSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NnWeightsSnapshots and returns the data saved in the database.
     * @param {NnWeightsSnapshotCreateManyAndReturnArgs} args - Arguments to create many NnWeightsSnapshots.
     * @example
     * // Create many NnWeightsSnapshots
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NnWeightsSnapshots and only return the `id`
     * const nnWeightsSnapshotWithIdOnly = await prisma.nnWeightsSnapshot.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NnWeightsSnapshotCreateManyAndReturnArgs>(args?: SelectSubset<T, NnWeightsSnapshotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NnWeightsSnapshot.
     * @param {NnWeightsSnapshotDeleteArgs} args - Arguments to delete one NnWeightsSnapshot.
     * @example
     * // Delete one NnWeightsSnapshot
     * const NnWeightsSnapshot = await prisma.nnWeightsSnapshot.delete({
     *   where: {
     *     // ... filter to delete one NnWeightsSnapshot
     *   }
     * })
     * 
     */
    delete<T extends NnWeightsSnapshotDeleteArgs>(args: SelectSubset<T, NnWeightsSnapshotDeleteArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NnWeightsSnapshot.
     * @param {NnWeightsSnapshotUpdateArgs} args - Arguments to update one NnWeightsSnapshot.
     * @example
     * // Update one NnWeightsSnapshot
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NnWeightsSnapshotUpdateArgs>(args: SelectSubset<T, NnWeightsSnapshotUpdateArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NnWeightsSnapshots.
     * @param {NnWeightsSnapshotDeleteManyArgs} args - Arguments to filter NnWeightsSnapshots to delete.
     * @example
     * // Delete a few NnWeightsSnapshots
     * const { count } = await prisma.nnWeightsSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NnWeightsSnapshotDeleteManyArgs>(args?: SelectSubset<T, NnWeightsSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NnWeightsSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NnWeightsSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NnWeightsSnapshots
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NnWeightsSnapshotUpdateManyArgs>(args: SelectSubset<T, NnWeightsSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NnWeightsSnapshots and returns the data updated in the database.
     * @param {NnWeightsSnapshotUpdateManyAndReturnArgs} args - Arguments to update many NnWeightsSnapshots.
     * @example
     * // Update many NnWeightsSnapshots
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NnWeightsSnapshots and only return the `id`
     * const nnWeightsSnapshotWithIdOnly = await prisma.nnWeightsSnapshot.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NnWeightsSnapshotUpdateManyAndReturnArgs>(args: SelectSubset<T, NnWeightsSnapshotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NnWeightsSnapshot.
     * @param {NnWeightsSnapshotUpsertArgs} args - Arguments to update or create a NnWeightsSnapshot.
     * @example
     * // Update or create a NnWeightsSnapshot
     * const nnWeightsSnapshot = await prisma.nnWeightsSnapshot.upsert({
     *   create: {
     *     // ... data to create a NnWeightsSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NnWeightsSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends NnWeightsSnapshotUpsertArgs>(args: SelectSubset<T, NnWeightsSnapshotUpsertArgs<ExtArgs>>): Prisma__NnWeightsSnapshotClient<$Result.GetResult<Prisma.$NnWeightsSnapshotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NnWeightsSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NnWeightsSnapshotCountArgs} args - Arguments to filter NnWeightsSnapshots to count.
     * @example
     * // Count the number of NnWeightsSnapshots
     * const count = await prisma.nnWeightsSnapshot.count({
     *   where: {
     *     // ... the filter for the NnWeightsSnapshots we want to count
     *   }
     * })
    **/
    count<T extends NnWeightsSnapshotCountArgs>(
      args?: Subset<T, NnWeightsSnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NnWeightsSnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NnWeightsSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NnWeightsSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NnWeightsSnapshotAggregateArgs>(args: Subset<T, NnWeightsSnapshotAggregateArgs>): Prisma.PrismaPromise<GetNnWeightsSnapshotAggregateType<T>>

    /**
     * Group by NnWeightsSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NnWeightsSnapshotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NnWeightsSnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NnWeightsSnapshotGroupByArgs['orderBy'] }
        : { orderBy?: NnWeightsSnapshotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NnWeightsSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNnWeightsSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NnWeightsSnapshot model
   */
  readonly fields: NnWeightsSnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NnWeightsSnapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NnWeightsSnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NnWeightsSnapshot model
   */
  interface NnWeightsSnapshotFieldRefs {
    readonly id: FieldRef<"NnWeightsSnapshot", 'Int'>
    readonly createdAt: FieldRef<"NnWeightsSnapshot", 'String'>
    readonly updates: FieldRef<"NnWeightsSnapshot", 'Int'>
    readonly payload: FieldRef<"NnWeightsSnapshot", 'String'>
  }
    

  // Custom InputTypes
  /**
   * NnWeightsSnapshot findUnique
   */
  export type NnWeightsSnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which NnWeightsSnapshot to fetch.
     */
    where: NnWeightsSnapshotWhereUniqueInput
  }

  /**
   * NnWeightsSnapshot findUniqueOrThrow
   */
  export type NnWeightsSnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which NnWeightsSnapshot to fetch.
     */
    where: NnWeightsSnapshotWhereUniqueInput
  }

  /**
   * NnWeightsSnapshot findFirst
   */
  export type NnWeightsSnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which NnWeightsSnapshot to fetch.
     */
    where?: NnWeightsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NnWeightsSnapshots to fetch.
     */
    orderBy?: NnWeightsSnapshotOrderByWithRelationInput | NnWeightsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NnWeightsSnapshots.
     */
    cursor?: NnWeightsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NnWeightsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NnWeightsSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NnWeightsSnapshots.
     */
    distinct?: NnWeightsSnapshotScalarFieldEnum | NnWeightsSnapshotScalarFieldEnum[]
  }

  /**
   * NnWeightsSnapshot findFirstOrThrow
   */
  export type NnWeightsSnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which NnWeightsSnapshot to fetch.
     */
    where?: NnWeightsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NnWeightsSnapshots to fetch.
     */
    orderBy?: NnWeightsSnapshotOrderByWithRelationInput | NnWeightsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NnWeightsSnapshots.
     */
    cursor?: NnWeightsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NnWeightsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NnWeightsSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NnWeightsSnapshots.
     */
    distinct?: NnWeightsSnapshotScalarFieldEnum | NnWeightsSnapshotScalarFieldEnum[]
  }

  /**
   * NnWeightsSnapshot findMany
   */
  export type NnWeightsSnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which NnWeightsSnapshots to fetch.
     */
    where?: NnWeightsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NnWeightsSnapshots to fetch.
     */
    orderBy?: NnWeightsSnapshotOrderByWithRelationInput | NnWeightsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NnWeightsSnapshots.
     */
    cursor?: NnWeightsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NnWeightsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NnWeightsSnapshots.
     */
    skip?: number
    distinct?: NnWeightsSnapshotScalarFieldEnum | NnWeightsSnapshotScalarFieldEnum[]
  }

  /**
   * NnWeightsSnapshot create
   */
  export type NnWeightsSnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to create a NnWeightsSnapshot.
     */
    data: XOR<NnWeightsSnapshotCreateInput, NnWeightsSnapshotUncheckedCreateInput>
  }

  /**
   * NnWeightsSnapshot createMany
   */
  export type NnWeightsSnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NnWeightsSnapshots.
     */
    data: NnWeightsSnapshotCreateManyInput | NnWeightsSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NnWeightsSnapshot createManyAndReturn
   */
  export type NnWeightsSnapshotCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * The data used to create many NnWeightsSnapshots.
     */
    data: NnWeightsSnapshotCreateManyInput | NnWeightsSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NnWeightsSnapshot update
   */
  export type NnWeightsSnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to update a NnWeightsSnapshot.
     */
    data: XOR<NnWeightsSnapshotUpdateInput, NnWeightsSnapshotUncheckedUpdateInput>
    /**
     * Choose, which NnWeightsSnapshot to update.
     */
    where: NnWeightsSnapshotWhereUniqueInput
  }

  /**
   * NnWeightsSnapshot updateMany
   */
  export type NnWeightsSnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NnWeightsSnapshots.
     */
    data: XOR<NnWeightsSnapshotUpdateManyMutationInput, NnWeightsSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which NnWeightsSnapshots to update
     */
    where?: NnWeightsSnapshotWhereInput
    /**
     * Limit how many NnWeightsSnapshots to update.
     */
    limit?: number
  }

  /**
   * NnWeightsSnapshot updateManyAndReturn
   */
  export type NnWeightsSnapshotUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * The data used to update NnWeightsSnapshots.
     */
    data: XOR<NnWeightsSnapshotUpdateManyMutationInput, NnWeightsSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which NnWeightsSnapshots to update
     */
    where?: NnWeightsSnapshotWhereInput
    /**
     * Limit how many NnWeightsSnapshots to update.
     */
    limit?: number
  }

  /**
   * NnWeightsSnapshot upsert
   */
  export type NnWeightsSnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * The filter to search for the NnWeightsSnapshot to update in case it exists.
     */
    where: NnWeightsSnapshotWhereUniqueInput
    /**
     * In case the NnWeightsSnapshot found by the `where` argument doesn't exist, create a new NnWeightsSnapshot with this data.
     */
    create: XOR<NnWeightsSnapshotCreateInput, NnWeightsSnapshotUncheckedCreateInput>
    /**
     * In case the NnWeightsSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NnWeightsSnapshotUpdateInput, NnWeightsSnapshotUncheckedUpdateInput>
  }

  /**
   * NnWeightsSnapshot delete
   */
  export type NnWeightsSnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
    /**
     * Filter which NnWeightsSnapshot to delete.
     */
    where: NnWeightsSnapshotWhereUniqueInput
  }

  /**
   * NnWeightsSnapshot deleteMany
   */
  export type NnWeightsSnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NnWeightsSnapshots to delete
     */
    where?: NnWeightsSnapshotWhereInput
    /**
     * Limit how many NnWeightsSnapshots to delete.
     */
    limit?: number
  }

  /**
   * NnWeightsSnapshot without action
   */
  export type NnWeightsSnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NnWeightsSnapshot
     */
    select?: NnWeightsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NnWeightsSnapshot
     */
    omit?: NnWeightsSnapshotOmit<ExtArgs> | null
  }


  /**
   * Model GameReplay
   */

  export type AggregateGameReplay = {
    _count: GameReplayCountAggregateOutputType | null
    _min: GameReplayMinAggregateOutputType | null
    _max: GameReplayMaxAggregateOutputType | null
  }

  export type GameReplayMinAggregateOutputType = {
    id: string | null
    createdAt: string | null
    result: string | null
    fen: string | null
    pgn: string | null
    movesJson: string | null
    metaJson: string | null
  }

  export type GameReplayMaxAggregateOutputType = {
    id: string | null
    createdAt: string | null
    result: string | null
    fen: string | null
    pgn: string | null
    movesJson: string | null
    metaJson: string | null
  }

  export type GameReplayCountAggregateOutputType = {
    id: number
    createdAt: number
    result: number
    fen: number
    pgn: number
    movesJson: number
    metaJson: number
    _all: number
  }


  export type GameReplayMinAggregateInputType = {
    id?: true
    createdAt?: true
    result?: true
    fen?: true
    pgn?: true
    movesJson?: true
    metaJson?: true
  }

  export type GameReplayMaxAggregateInputType = {
    id?: true
    createdAt?: true
    result?: true
    fen?: true
    pgn?: true
    movesJson?: true
    metaJson?: true
  }

  export type GameReplayCountAggregateInputType = {
    id?: true
    createdAt?: true
    result?: true
    fen?: true
    pgn?: true
    movesJson?: true
    metaJson?: true
    _all?: true
  }

  export type GameReplayAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameReplay to aggregate.
     */
    where?: GameReplayWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameReplays to fetch.
     */
    orderBy?: GameReplayOrderByWithRelationInput | GameReplayOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameReplayWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameReplays from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameReplays.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameReplays
    **/
    _count?: true | GameReplayCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameReplayMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameReplayMaxAggregateInputType
  }

  export type GetGameReplayAggregateType<T extends GameReplayAggregateArgs> = {
        [P in keyof T & keyof AggregateGameReplay]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameReplay[P]>
      : GetScalarType<T[P], AggregateGameReplay[P]>
  }




  export type GameReplayGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameReplayWhereInput
    orderBy?: GameReplayOrderByWithAggregationInput | GameReplayOrderByWithAggregationInput[]
    by: GameReplayScalarFieldEnum[] | GameReplayScalarFieldEnum
    having?: GameReplayScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameReplayCountAggregateInputType | true
    _min?: GameReplayMinAggregateInputType
    _max?: GameReplayMaxAggregateInputType
  }

  export type GameReplayGroupByOutputType = {
    id: string
    createdAt: string
    result: string
    fen: string | null
    pgn: string | null
    movesJson: string
    metaJson: string
    _count: GameReplayCountAggregateOutputType | null
    _min: GameReplayMinAggregateOutputType | null
    _max: GameReplayMaxAggregateOutputType | null
  }

  type GetGameReplayGroupByPayload<T extends GameReplayGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameReplayGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameReplayGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameReplayGroupByOutputType[P]>
            : GetScalarType<T[P], GameReplayGroupByOutputType[P]>
        }
      >
    >


  export type GameReplaySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    result?: boolean
    fen?: boolean
    pgn?: boolean
    movesJson?: boolean
    metaJson?: boolean
    bufferRows?: boolean | GameReplay$bufferRowsArgs<ExtArgs>
    _count?: boolean | GameReplayCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameReplay"]>

  export type GameReplaySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    result?: boolean
    fen?: boolean
    pgn?: boolean
    movesJson?: boolean
    metaJson?: boolean
  }, ExtArgs["result"]["gameReplay"]>

  export type GameReplaySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    result?: boolean
    fen?: boolean
    pgn?: boolean
    movesJson?: boolean
    metaJson?: boolean
  }, ExtArgs["result"]["gameReplay"]>

  export type GameReplaySelectScalar = {
    id?: boolean
    createdAt?: boolean
    result?: boolean
    fen?: boolean
    pgn?: boolean
    movesJson?: boolean
    metaJson?: boolean
  }

  export type GameReplayOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "result" | "fen" | "pgn" | "movesJson" | "metaJson", ExtArgs["result"]["gameReplay"]>
  export type GameReplayInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bufferRows?: boolean | GameReplay$bufferRowsArgs<ExtArgs>
    _count?: boolean | GameReplayCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GameReplayIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type GameReplayIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $GameReplayPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameReplay"
    objects: {
      bufferRows: Prisma.$ReplayBufferRowPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: string
      result: string
      fen: string | null
      pgn: string | null
      movesJson: string
      metaJson: string
    }, ExtArgs["result"]["gameReplay"]>
    composites: {}
  }

  type GameReplayGetPayload<S extends boolean | null | undefined | GameReplayDefaultArgs> = $Result.GetResult<Prisma.$GameReplayPayload, S>

  type GameReplayCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GameReplayFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GameReplayCountAggregateInputType | true
    }

  export interface GameReplayDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameReplay'], meta: { name: 'GameReplay' } }
    /**
     * Find zero or one GameReplay that matches the filter.
     * @param {GameReplayFindUniqueArgs} args - Arguments to find a GameReplay
     * @example
     * // Get one GameReplay
     * const gameReplay = await prisma.gameReplay.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameReplayFindUniqueArgs>(args: SelectSubset<T, GameReplayFindUniqueArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GameReplay that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GameReplayFindUniqueOrThrowArgs} args - Arguments to find a GameReplay
     * @example
     * // Get one GameReplay
     * const gameReplay = await prisma.gameReplay.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameReplayFindUniqueOrThrowArgs>(args: SelectSubset<T, GameReplayFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GameReplay that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameReplayFindFirstArgs} args - Arguments to find a GameReplay
     * @example
     * // Get one GameReplay
     * const gameReplay = await prisma.gameReplay.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameReplayFindFirstArgs>(args?: SelectSubset<T, GameReplayFindFirstArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GameReplay that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameReplayFindFirstOrThrowArgs} args - Arguments to find a GameReplay
     * @example
     * // Get one GameReplay
     * const gameReplay = await prisma.gameReplay.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameReplayFindFirstOrThrowArgs>(args?: SelectSubset<T, GameReplayFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GameReplays that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameReplayFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameReplays
     * const gameReplays = await prisma.gameReplay.findMany()
     * 
     * // Get first 10 GameReplays
     * const gameReplays = await prisma.gameReplay.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameReplayWithIdOnly = await prisma.gameReplay.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameReplayFindManyArgs>(args?: SelectSubset<T, GameReplayFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GameReplay.
     * @param {GameReplayCreateArgs} args - Arguments to create a GameReplay.
     * @example
     * // Create one GameReplay
     * const GameReplay = await prisma.gameReplay.create({
     *   data: {
     *     // ... data to create a GameReplay
     *   }
     * })
     * 
     */
    create<T extends GameReplayCreateArgs>(args: SelectSubset<T, GameReplayCreateArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GameReplays.
     * @param {GameReplayCreateManyArgs} args - Arguments to create many GameReplays.
     * @example
     * // Create many GameReplays
     * const gameReplay = await prisma.gameReplay.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameReplayCreateManyArgs>(args?: SelectSubset<T, GameReplayCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GameReplays and returns the data saved in the database.
     * @param {GameReplayCreateManyAndReturnArgs} args - Arguments to create many GameReplays.
     * @example
     * // Create many GameReplays
     * const gameReplay = await prisma.gameReplay.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GameReplays and only return the `id`
     * const gameReplayWithIdOnly = await prisma.gameReplay.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GameReplayCreateManyAndReturnArgs>(args?: SelectSubset<T, GameReplayCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GameReplay.
     * @param {GameReplayDeleteArgs} args - Arguments to delete one GameReplay.
     * @example
     * // Delete one GameReplay
     * const GameReplay = await prisma.gameReplay.delete({
     *   where: {
     *     // ... filter to delete one GameReplay
     *   }
     * })
     * 
     */
    delete<T extends GameReplayDeleteArgs>(args: SelectSubset<T, GameReplayDeleteArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GameReplay.
     * @param {GameReplayUpdateArgs} args - Arguments to update one GameReplay.
     * @example
     * // Update one GameReplay
     * const gameReplay = await prisma.gameReplay.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameReplayUpdateArgs>(args: SelectSubset<T, GameReplayUpdateArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GameReplays.
     * @param {GameReplayDeleteManyArgs} args - Arguments to filter GameReplays to delete.
     * @example
     * // Delete a few GameReplays
     * const { count } = await prisma.gameReplay.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameReplayDeleteManyArgs>(args?: SelectSubset<T, GameReplayDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameReplays.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameReplayUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameReplays
     * const gameReplay = await prisma.gameReplay.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameReplayUpdateManyArgs>(args: SelectSubset<T, GameReplayUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameReplays and returns the data updated in the database.
     * @param {GameReplayUpdateManyAndReturnArgs} args - Arguments to update many GameReplays.
     * @example
     * // Update many GameReplays
     * const gameReplay = await prisma.gameReplay.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GameReplays and only return the `id`
     * const gameReplayWithIdOnly = await prisma.gameReplay.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GameReplayUpdateManyAndReturnArgs>(args: SelectSubset<T, GameReplayUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GameReplay.
     * @param {GameReplayUpsertArgs} args - Arguments to update or create a GameReplay.
     * @example
     * // Update or create a GameReplay
     * const gameReplay = await prisma.gameReplay.upsert({
     *   create: {
     *     // ... data to create a GameReplay
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameReplay we want to update
     *   }
     * })
     */
    upsert<T extends GameReplayUpsertArgs>(args: SelectSubset<T, GameReplayUpsertArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GameReplays.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameReplayCountArgs} args - Arguments to filter GameReplays to count.
     * @example
     * // Count the number of GameReplays
     * const count = await prisma.gameReplay.count({
     *   where: {
     *     // ... the filter for the GameReplays we want to count
     *   }
     * })
    **/
    count<T extends GameReplayCountArgs>(
      args?: Subset<T, GameReplayCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameReplayCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameReplay.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameReplayAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameReplayAggregateArgs>(args: Subset<T, GameReplayAggregateArgs>): Prisma.PrismaPromise<GetGameReplayAggregateType<T>>

    /**
     * Group by GameReplay.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameReplayGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameReplayGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameReplayGroupByArgs['orderBy'] }
        : { orderBy?: GameReplayGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameReplayGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameReplayGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameReplay model
   */
  readonly fields: GameReplayFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameReplay.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameReplayClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bufferRows<T extends GameReplay$bufferRowsArgs<ExtArgs> = {}>(args?: Subset<T, GameReplay$bufferRowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GameReplay model
   */
  interface GameReplayFieldRefs {
    readonly id: FieldRef<"GameReplay", 'String'>
    readonly createdAt: FieldRef<"GameReplay", 'String'>
    readonly result: FieldRef<"GameReplay", 'String'>
    readonly fen: FieldRef<"GameReplay", 'String'>
    readonly pgn: FieldRef<"GameReplay", 'String'>
    readonly movesJson: FieldRef<"GameReplay", 'String'>
    readonly metaJson: FieldRef<"GameReplay", 'String'>
  }
    

  // Custom InputTypes
  /**
   * GameReplay findUnique
   */
  export type GameReplayFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * Filter, which GameReplay to fetch.
     */
    where: GameReplayWhereUniqueInput
  }

  /**
   * GameReplay findUniqueOrThrow
   */
  export type GameReplayFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * Filter, which GameReplay to fetch.
     */
    where: GameReplayWhereUniqueInput
  }

  /**
   * GameReplay findFirst
   */
  export type GameReplayFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * Filter, which GameReplay to fetch.
     */
    where?: GameReplayWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameReplays to fetch.
     */
    orderBy?: GameReplayOrderByWithRelationInput | GameReplayOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameReplays.
     */
    cursor?: GameReplayWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameReplays from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameReplays.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameReplays.
     */
    distinct?: GameReplayScalarFieldEnum | GameReplayScalarFieldEnum[]
  }

  /**
   * GameReplay findFirstOrThrow
   */
  export type GameReplayFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * Filter, which GameReplay to fetch.
     */
    where?: GameReplayWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameReplays to fetch.
     */
    orderBy?: GameReplayOrderByWithRelationInput | GameReplayOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameReplays.
     */
    cursor?: GameReplayWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameReplays from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameReplays.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameReplays.
     */
    distinct?: GameReplayScalarFieldEnum | GameReplayScalarFieldEnum[]
  }

  /**
   * GameReplay findMany
   */
  export type GameReplayFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * Filter, which GameReplays to fetch.
     */
    where?: GameReplayWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameReplays to fetch.
     */
    orderBy?: GameReplayOrderByWithRelationInput | GameReplayOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameReplays.
     */
    cursor?: GameReplayWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameReplays from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameReplays.
     */
    skip?: number
    distinct?: GameReplayScalarFieldEnum | GameReplayScalarFieldEnum[]
  }

  /**
   * GameReplay create
   */
  export type GameReplayCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * The data needed to create a GameReplay.
     */
    data: XOR<GameReplayCreateInput, GameReplayUncheckedCreateInput>
  }

  /**
   * GameReplay createMany
   */
  export type GameReplayCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameReplays.
     */
    data: GameReplayCreateManyInput | GameReplayCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameReplay createManyAndReturn
   */
  export type GameReplayCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * The data used to create many GameReplays.
     */
    data: GameReplayCreateManyInput | GameReplayCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameReplay update
   */
  export type GameReplayUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * The data needed to update a GameReplay.
     */
    data: XOR<GameReplayUpdateInput, GameReplayUncheckedUpdateInput>
    /**
     * Choose, which GameReplay to update.
     */
    where: GameReplayWhereUniqueInput
  }

  /**
   * GameReplay updateMany
   */
  export type GameReplayUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameReplays.
     */
    data: XOR<GameReplayUpdateManyMutationInput, GameReplayUncheckedUpdateManyInput>
    /**
     * Filter which GameReplays to update
     */
    where?: GameReplayWhereInput
    /**
     * Limit how many GameReplays to update.
     */
    limit?: number
  }

  /**
   * GameReplay updateManyAndReturn
   */
  export type GameReplayUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * The data used to update GameReplays.
     */
    data: XOR<GameReplayUpdateManyMutationInput, GameReplayUncheckedUpdateManyInput>
    /**
     * Filter which GameReplays to update
     */
    where?: GameReplayWhereInput
    /**
     * Limit how many GameReplays to update.
     */
    limit?: number
  }

  /**
   * GameReplay upsert
   */
  export type GameReplayUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * The filter to search for the GameReplay to update in case it exists.
     */
    where: GameReplayWhereUniqueInput
    /**
     * In case the GameReplay found by the `where` argument doesn't exist, create a new GameReplay with this data.
     */
    create: XOR<GameReplayCreateInput, GameReplayUncheckedCreateInput>
    /**
     * In case the GameReplay was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameReplayUpdateInput, GameReplayUncheckedUpdateInput>
  }

  /**
   * GameReplay delete
   */
  export type GameReplayDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
    /**
     * Filter which GameReplay to delete.
     */
    where: GameReplayWhereUniqueInput
  }

  /**
   * GameReplay deleteMany
   */
  export type GameReplayDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameReplays to delete
     */
    where?: GameReplayWhereInput
    /**
     * Limit how many GameReplays to delete.
     */
    limit?: number
  }

  /**
   * GameReplay.bufferRows
   */
  export type GameReplay$bufferRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    where?: ReplayBufferRowWhereInput
    orderBy?: ReplayBufferRowOrderByWithRelationInput | ReplayBufferRowOrderByWithRelationInput[]
    cursor?: ReplayBufferRowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReplayBufferRowScalarFieldEnum | ReplayBufferRowScalarFieldEnum[]
  }

  /**
   * GameReplay without action
   */
  export type GameReplayDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameReplay
     */
    select?: GameReplaySelect<ExtArgs> | null
    /**
     * Omit specific fields from the GameReplay
     */
    omit?: GameReplayOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameReplayInclude<ExtArgs> | null
  }


  /**
   * Model ReplayBufferRow
   */

  export type AggregateReplayBufferRow = {
    _count: ReplayBufferRowCountAggregateOutputType | null
    _avg: ReplayBufferRowAvgAggregateOutputType | null
    _sum: ReplayBufferRowSumAggregateOutputType | null
    _min: ReplayBufferRowMinAggregateOutputType | null
    _max: ReplayBufferRowMaxAggregateOutputType | null
  }

  export type ReplayBufferRowAvgAggregateOutputType = {
    id: number | null
    ply: number | null
  }

  export type ReplayBufferRowSumAggregateOutputType = {
    id: number | null
    ply: number | null
  }

  export type ReplayBufferRowMinAggregateOutputType = {
    id: number | null
    replayId: string | null
    createdAt: string | null
    result: string | null
    ply: number | null
    fen: string | null
  }

  export type ReplayBufferRowMaxAggregateOutputType = {
    id: number | null
    replayId: string | null
    createdAt: string | null
    result: string | null
    ply: number | null
    fen: string | null
  }

  export type ReplayBufferRowCountAggregateOutputType = {
    id: number
    replayId: number
    createdAt: number
    result: number
    ply: number
    fen: number
    _all: number
  }


  export type ReplayBufferRowAvgAggregateInputType = {
    id?: true
    ply?: true
  }

  export type ReplayBufferRowSumAggregateInputType = {
    id?: true
    ply?: true
  }

  export type ReplayBufferRowMinAggregateInputType = {
    id?: true
    replayId?: true
    createdAt?: true
    result?: true
    ply?: true
    fen?: true
  }

  export type ReplayBufferRowMaxAggregateInputType = {
    id?: true
    replayId?: true
    createdAt?: true
    result?: true
    ply?: true
    fen?: true
  }

  export type ReplayBufferRowCountAggregateInputType = {
    id?: true
    replayId?: true
    createdAt?: true
    result?: true
    ply?: true
    fen?: true
    _all?: true
  }

  export type ReplayBufferRowAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReplayBufferRow to aggregate.
     */
    where?: ReplayBufferRowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReplayBufferRows to fetch.
     */
    orderBy?: ReplayBufferRowOrderByWithRelationInput | ReplayBufferRowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReplayBufferRowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReplayBufferRows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReplayBufferRows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReplayBufferRows
    **/
    _count?: true | ReplayBufferRowCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReplayBufferRowAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReplayBufferRowSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReplayBufferRowMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReplayBufferRowMaxAggregateInputType
  }

  export type GetReplayBufferRowAggregateType<T extends ReplayBufferRowAggregateArgs> = {
        [P in keyof T & keyof AggregateReplayBufferRow]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReplayBufferRow[P]>
      : GetScalarType<T[P], AggregateReplayBufferRow[P]>
  }




  export type ReplayBufferRowGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReplayBufferRowWhereInput
    orderBy?: ReplayBufferRowOrderByWithAggregationInput | ReplayBufferRowOrderByWithAggregationInput[]
    by: ReplayBufferRowScalarFieldEnum[] | ReplayBufferRowScalarFieldEnum
    having?: ReplayBufferRowScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReplayBufferRowCountAggregateInputType | true
    _avg?: ReplayBufferRowAvgAggregateInputType
    _sum?: ReplayBufferRowSumAggregateInputType
    _min?: ReplayBufferRowMinAggregateInputType
    _max?: ReplayBufferRowMaxAggregateInputType
  }

  export type ReplayBufferRowGroupByOutputType = {
    id: number
    replayId: string
    createdAt: string
    result: string
    ply: number
    fen: string
    _count: ReplayBufferRowCountAggregateOutputType | null
    _avg: ReplayBufferRowAvgAggregateOutputType | null
    _sum: ReplayBufferRowSumAggregateOutputType | null
    _min: ReplayBufferRowMinAggregateOutputType | null
    _max: ReplayBufferRowMaxAggregateOutputType | null
  }

  type GetReplayBufferRowGroupByPayload<T extends ReplayBufferRowGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReplayBufferRowGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReplayBufferRowGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReplayBufferRowGroupByOutputType[P]>
            : GetScalarType<T[P], ReplayBufferRowGroupByOutputType[P]>
        }
      >
    >


  export type ReplayBufferRowSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    replayId?: boolean
    createdAt?: boolean
    result?: boolean
    ply?: boolean
    fen?: boolean
    replay?: boolean | GameReplayDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["replayBufferRow"]>

  export type ReplayBufferRowSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    replayId?: boolean
    createdAt?: boolean
    result?: boolean
    ply?: boolean
    fen?: boolean
    replay?: boolean | GameReplayDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["replayBufferRow"]>

  export type ReplayBufferRowSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    replayId?: boolean
    createdAt?: boolean
    result?: boolean
    ply?: boolean
    fen?: boolean
    replay?: boolean | GameReplayDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["replayBufferRow"]>

  export type ReplayBufferRowSelectScalar = {
    id?: boolean
    replayId?: boolean
    createdAt?: boolean
    result?: boolean
    ply?: boolean
    fen?: boolean
  }

  export type ReplayBufferRowOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "replayId" | "createdAt" | "result" | "ply" | "fen", ExtArgs["result"]["replayBufferRow"]>
  export type ReplayBufferRowInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    replay?: boolean | GameReplayDefaultArgs<ExtArgs>
  }
  export type ReplayBufferRowIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    replay?: boolean | GameReplayDefaultArgs<ExtArgs>
  }
  export type ReplayBufferRowIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    replay?: boolean | GameReplayDefaultArgs<ExtArgs>
  }

  export type $ReplayBufferRowPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReplayBufferRow"
    objects: {
      replay: Prisma.$GameReplayPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      replayId: string
      createdAt: string
      result: string
      ply: number
      fen: string
    }, ExtArgs["result"]["replayBufferRow"]>
    composites: {}
  }

  type ReplayBufferRowGetPayload<S extends boolean | null | undefined | ReplayBufferRowDefaultArgs> = $Result.GetResult<Prisma.$ReplayBufferRowPayload, S>

  type ReplayBufferRowCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReplayBufferRowFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReplayBufferRowCountAggregateInputType | true
    }

  export interface ReplayBufferRowDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReplayBufferRow'], meta: { name: 'ReplayBufferRow' } }
    /**
     * Find zero or one ReplayBufferRow that matches the filter.
     * @param {ReplayBufferRowFindUniqueArgs} args - Arguments to find a ReplayBufferRow
     * @example
     * // Get one ReplayBufferRow
     * const replayBufferRow = await prisma.replayBufferRow.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReplayBufferRowFindUniqueArgs>(args: SelectSubset<T, ReplayBufferRowFindUniqueArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReplayBufferRow that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReplayBufferRowFindUniqueOrThrowArgs} args - Arguments to find a ReplayBufferRow
     * @example
     * // Get one ReplayBufferRow
     * const replayBufferRow = await prisma.replayBufferRow.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReplayBufferRowFindUniqueOrThrowArgs>(args: SelectSubset<T, ReplayBufferRowFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReplayBufferRow that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReplayBufferRowFindFirstArgs} args - Arguments to find a ReplayBufferRow
     * @example
     * // Get one ReplayBufferRow
     * const replayBufferRow = await prisma.replayBufferRow.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReplayBufferRowFindFirstArgs>(args?: SelectSubset<T, ReplayBufferRowFindFirstArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReplayBufferRow that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReplayBufferRowFindFirstOrThrowArgs} args - Arguments to find a ReplayBufferRow
     * @example
     * // Get one ReplayBufferRow
     * const replayBufferRow = await prisma.replayBufferRow.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReplayBufferRowFindFirstOrThrowArgs>(args?: SelectSubset<T, ReplayBufferRowFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReplayBufferRows that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReplayBufferRowFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReplayBufferRows
     * const replayBufferRows = await prisma.replayBufferRow.findMany()
     * 
     * // Get first 10 ReplayBufferRows
     * const replayBufferRows = await prisma.replayBufferRow.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const replayBufferRowWithIdOnly = await prisma.replayBufferRow.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReplayBufferRowFindManyArgs>(args?: SelectSubset<T, ReplayBufferRowFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReplayBufferRow.
     * @param {ReplayBufferRowCreateArgs} args - Arguments to create a ReplayBufferRow.
     * @example
     * // Create one ReplayBufferRow
     * const ReplayBufferRow = await prisma.replayBufferRow.create({
     *   data: {
     *     // ... data to create a ReplayBufferRow
     *   }
     * })
     * 
     */
    create<T extends ReplayBufferRowCreateArgs>(args: SelectSubset<T, ReplayBufferRowCreateArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReplayBufferRows.
     * @param {ReplayBufferRowCreateManyArgs} args - Arguments to create many ReplayBufferRows.
     * @example
     * // Create many ReplayBufferRows
     * const replayBufferRow = await prisma.replayBufferRow.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReplayBufferRowCreateManyArgs>(args?: SelectSubset<T, ReplayBufferRowCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReplayBufferRows and returns the data saved in the database.
     * @param {ReplayBufferRowCreateManyAndReturnArgs} args - Arguments to create many ReplayBufferRows.
     * @example
     * // Create many ReplayBufferRows
     * const replayBufferRow = await prisma.replayBufferRow.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReplayBufferRows and only return the `id`
     * const replayBufferRowWithIdOnly = await prisma.replayBufferRow.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReplayBufferRowCreateManyAndReturnArgs>(args?: SelectSubset<T, ReplayBufferRowCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReplayBufferRow.
     * @param {ReplayBufferRowDeleteArgs} args - Arguments to delete one ReplayBufferRow.
     * @example
     * // Delete one ReplayBufferRow
     * const ReplayBufferRow = await prisma.replayBufferRow.delete({
     *   where: {
     *     // ... filter to delete one ReplayBufferRow
     *   }
     * })
     * 
     */
    delete<T extends ReplayBufferRowDeleteArgs>(args: SelectSubset<T, ReplayBufferRowDeleteArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReplayBufferRow.
     * @param {ReplayBufferRowUpdateArgs} args - Arguments to update one ReplayBufferRow.
     * @example
     * // Update one ReplayBufferRow
     * const replayBufferRow = await prisma.replayBufferRow.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReplayBufferRowUpdateArgs>(args: SelectSubset<T, ReplayBufferRowUpdateArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReplayBufferRows.
     * @param {ReplayBufferRowDeleteManyArgs} args - Arguments to filter ReplayBufferRows to delete.
     * @example
     * // Delete a few ReplayBufferRows
     * const { count } = await prisma.replayBufferRow.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReplayBufferRowDeleteManyArgs>(args?: SelectSubset<T, ReplayBufferRowDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReplayBufferRows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReplayBufferRowUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReplayBufferRows
     * const replayBufferRow = await prisma.replayBufferRow.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReplayBufferRowUpdateManyArgs>(args: SelectSubset<T, ReplayBufferRowUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReplayBufferRows and returns the data updated in the database.
     * @param {ReplayBufferRowUpdateManyAndReturnArgs} args - Arguments to update many ReplayBufferRows.
     * @example
     * // Update many ReplayBufferRows
     * const replayBufferRow = await prisma.replayBufferRow.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReplayBufferRows and only return the `id`
     * const replayBufferRowWithIdOnly = await prisma.replayBufferRow.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReplayBufferRowUpdateManyAndReturnArgs>(args: SelectSubset<T, ReplayBufferRowUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReplayBufferRow.
     * @param {ReplayBufferRowUpsertArgs} args - Arguments to update or create a ReplayBufferRow.
     * @example
     * // Update or create a ReplayBufferRow
     * const replayBufferRow = await prisma.replayBufferRow.upsert({
     *   create: {
     *     // ... data to create a ReplayBufferRow
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReplayBufferRow we want to update
     *   }
     * })
     */
    upsert<T extends ReplayBufferRowUpsertArgs>(args: SelectSubset<T, ReplayBufferRowUpsertArgs<ExtArgs>>): Prisma__ReplayBufferRowClient<$Result.GetResult<Prisma.$ReplayBufferRowPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReplayBufferRows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReplayBufferRowCountArgs} args - Arguments to filter ReplayBufferRows to count.
     * @example
     * // Count the number of ReplayBufferRows
     * const count = await prisma.replayBufferRow.count({
     *   where: {
     *     // ... the filter for the ReplayBufferRows we want to count
     *   }
     * })
    **/
    count<T extends ReplayBufferRowCountArgs>(
      args?: Subset<T, ReplayBufferRowCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReplayBufferRowCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReplayBufferRow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReplayBufferRowAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReplayBufferRowAggregateArgs>(args: Subset<T, ReplayBufferRowAggregateArgs>): Prisma.PrismaPromise<GetReplayBufferRowAggregateType<T>>

    /**
     * Group by ReplayBufferRow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReplayBufferRowGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReplayBufferRowGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReplayBufferRowGroupByArgs['orderBy'] }
        : { orderBy?: ReplayBufferRowGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReplayBufferRowGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReplayBufferRowGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReplayBufferRow model
   */
  readonly fields: ReplayBufferRowFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReplayBufferRow.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReplayBufferRowClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    replay<T extends GameReplayDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GameReplayDefaultArgs<ExtArgs>>): Prisma__GameReplayClient<$Result.GetResult<Prisma.$GameReplayPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReplayBufferRow model
   */
  interface ReplayBufferRowFieldRefs {
    readonly id: FieldRef<"ReplayBufferRow", 'Int'>
    readonly replayId: FieldRef<"ReplayBufferRow", 'String'>
    readonly createdAt: FieldRef<"ReplayBufferRow", 'String'>
    readonly result: FieldRef<"ReplayBufferRow", 'String'>
    readonly ply: FieldRef<"ReplayBufferRow", 'Int'>
    readonly fen: FieldRef<"ReplayBufferRow", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ReplayBufferRow findUnique
   */
  export type ReplayBufferRowFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * Filter, which ReplayBufferRow to fetch.
     */
    where: ReplayBufferRowWhereUniqueInput
  }

  /**
   * ReplayBufferRow findUniqueOrThrow
   */
  export type ReplayBufferRowFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * Filter, which ReplayBufferRow to fetch.
     */
    where: ReplayBufferRowWhereUniqueInput
  }

  /**
   * ReplayBufferRow findFirst
   */
  export type ReplayBufferRowFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * Filter, which ReplayBufferRow to fetch.
     */
    where?: ReplayBufferRowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReplayBufferRows to fetch.
     */
    orderBy?: ReplayBufferRowOrderByWithRelationInput | ReplayBufferRowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReplayBufferRows.
     */
    cursor?: ReplayBufferRowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReplayBufferRows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReplayBufferRows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReplayBufferRows.
     */
    distinct?: ReplayBufferRowScalarFieldEnum | ReplayBufferRowScalarFieldEnum[]
  }

  /**
   * ReplayBufferRow findFirstOrThrow
   */
  export type ReplayBufferRowFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * Filter, which ReplayBufferRow to fetch.
     */
    where?: ReplayBufferRowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReplayBufferRows to fetch.
     */
    orderBy?: ReplayBufferRowOrderByWithRelationInput | ReplayBufferRowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReplayBufferRows.
     */
    cursor?: ReplayBufferRowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReplayBufferRows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReplayBufferRows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReplayBufferRows.
     */
    distinct?: ReplayBufferRowScalarFieldEnum | ReplayBufferRowScalarFieldEnum[]
  }

  /**
   * ReplayBufferRow findMany
   */
  export type ReplayBufferRowFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * Filter, which ReplayBufferRows to fetch.
     */
    where?: ReplayBufferRowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReplayBufferRows to fetch.
     */
    orderBy?: ReplayBufferRowOrderByWithRelationInput | ReplayBufferRowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReplayBufferRows.
     */
    cursor?: ReplayBufferRowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReplayBufferRows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReplayBufferRows.
     */
    skip?: number
    distinct?: ReplayBufferRowScalarFieldEnum | ReplayBufferRowScalarFieldEnum[]
  }

  /**
   * ReplayBufferRow create
   */
  export type ReplayBufferRowCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * The data needed to create a ReplayBufferRow.
     */
    data: XOR<ReplayBufferRowCreateInput, ReplayBufferRowUncheckedCreateInput>
  }

  /**
   * ReplayBufferRow createMany
   */
  export type ReplayBufferRowCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReplayBufferRows.
     */
    data: ReplayBufferRowCreateManyInput | ReplayBufferRowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReplayBufferRow createManyAndReturn
   */
  export type ReplayBufferRowCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * The data used to create many ReplayBufferRows.
     */
    data: ReplayBufferRowCreateManyInput | ReplayBufferRowCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReplayBufferRow update
   */
  export type ReplayBufferRowUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * The data needed to update a ReplayBufferRow.
     */
    data: XOR<ReplayBufferRowUpdateInput, ReplayBufferRowUncheckedUpdateInput>
    /**
     * Choose, which ReplayBufferRow to update.
     */
    where: ReplayBufferRowWhereUniqueInput
  }

  /**
   * ReplayBufferRow updateMany
   */
  export type ReplayBufferRowUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReplayBufferRows.
     */
    data: XOR<ReplayBufferRowUpdateManyMutationInput, ReplayBufferRowUncheckedUpdateManyInput>
    /**
     * Filter which ReplayBufferRows to update
     */
    where?: ReplayBufferRowWhereInput
    /**
     * Limit how many ReplayBufferRows to update.
     */
    limit?: number
  }

  /**
   * ReplayBufferRow updateManyAndReturn
   */
  export type ReplayBufferRowUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * The data used to update ReplayBufferRows.
     */
    data: XOR<ReplayBufferRowUpdateManyMutationInput, ReplayBufferRowUncheckedUpdateManyInput>
    /**
     * Filter which ReplayBufferRows to update
     */
    where?: ReplayBufferRowWhereInput
    /**
     * Limit how many ReplayBufferRows to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReplayBufferRow upsert
   */
  export type ReplayBufferRowUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * The filter to search for the ReplayBufferRow to update in case it exists.
     */
    where: ReplayBufferRowWhereUniqueInput
    /**
     * In case the ReplayBufferRow found by the `where` argument doesn't exist, create a new ReplayBufferRow with this data.
     */
    create: XOR<ReplayBufferRowCreateInput, ReplayBufferRowUncheckedCreateInput>
    /**
     * In case the ReplayBufferRow was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReplayBufferRowUpdateInput, ReplayBufferRowUncheckedUpdateInput>
  }

  /**
   * ReplayBufferRow delete
   */
  export type ReplayBufferRowDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
    /**
     * Filter which ReplayBufferRow to delete.
     */
    where: ReplayBufferRowWhereUniqueInput
  }

  /**
   * ReplayBufferRow deleteMany
   */
  export type ReplayBufferRowDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReplayBufferRows to delete
     */
    where?: ReplayBufferRowWhereInput
    /**
     * Limit how many ReplayBufferRows to delete.
     */
    limit?: number
  }

  /**
   * ReplayBufferRow without action
   */
  export type ReplayBufferRowDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReplayBufferRow
     */
    select?: ReplayBufferRowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReplayBufferRow
     */
    omit?: ReplayBufferRowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReplayBufferRowInclude<ExtArgs> | null
  }


  /**
   * Model LobbyRanking
   */

  export type AggregateLobbyRanking = {
    _count: LobbyRankingCountAggregateOutputType | null
    _avg: LobbyRankingAvgAggregateOutputType | null
    _sum: LobbyRankingSumAggregateOutputType | null
    _min: LobbyRankingMinAggregateOutputType | null
    _max: LobbyRankingMaxAggregateOutputType | null
  }

  export type LobbyRankingAvgAggregateOutputType = {
    scoreWhite: number | null
    scoreBlack: number | null
    durationSec: number | null
  }

  export type LobbyRankingSumAggregateOutputType = {
    scoreWhite: number | null
    scoreBlack: number | null
    durationSec: number | null
  }

  export type LobbyRankingMinAggregateOutputType = {
    id: string | null
    lobbyId: string | null
    whiteName: string | null
    blackName: string | null
    winner: string | null
    reasonCode: string | null
    reasonLabel: string | null
    scoreWhite: number | null
    scoreBlack: number | null
    durationSec: number | null
    startedAt: string | null
    endedAt: string | null
    recordedAt: string | null
  }

  export type LobbyRankingMaxAggregateOutputType = {
    id: string | null
    lobbyId: string | null
    whiteName: string | null
    blackName: string | null
    winner: string | null
    reasonCode: string | null
    reasonLabel: string | null
    scoreWhite: number | null
    scoreBlack: number | null
    durationSec: number | null
    startedAt: string | null
    endedAt: string | null
    recordedAt: string | null
  }

  export type LobbyRankingCountAggregateOutputType = {
    id: number
    lobbyId: number
    whiteName: number
    blackName: number
    winner: number
    reasonCode: number
    reasonLabel: number
    scoreWhite: number
    scoreBlack: number
    durationSec: number
    startedAt: number
    endedAt: number
    recordedAt: number
    _all: number
  }


  export type LobbyRankingAvgAggregateInputType = {
    scoreWhite?: true
    scoreBlack?: true
    durationSec?: true
  }

  export type LobbyRankingSumAggregateInputType = {
    scoreWhite?: true
    scoreBlack?: true
    durationSec?: true
  }

  export type LobbyRankingMinAggregateInputType = {
    id?: true
    lobbyId?: true
    whiteName?: true
    blackName?: true
    winner?: true
    reasonCode?: true
    reasonLabel?: true
    scoreWhite?: true
    scoreBlack?: true
    durationSec?: true
    startedAt?: true
    endedAt?: true
    recordedAt?: true
  }

  export type LobbyRankingMaxAggregateInputType = {
    id?: true
    lobbyId?: true
    whiteName?: true
    blackName?: true
    winner?: true
    reasonCode?: true
    reasonLabel?: true
    scoreWhite?: true
    scoreBlack?: true
    durationSec?: true
    startedAt?: true
    endedAt?: true
    recordedAt?: true
  }

  export type LobbyRankingCountAggregateInputType = {
    id?: true
    lobbyId?: true
    whiteName?: true
    blackName?: true
    winner?: true
    reasonCode?: true
    reasonLabel?: true
    scoreWhite?: true
    scoreBlack?: true
    durationSec?: true
    startedAt?: true
    endedAt?: true
    recordedAt?: true
    _all?: true
  }

  export type LobbyRankingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LobbyRanking to aggregate.
     */
    where?: LobbyRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LobbyRankings to fetch.
     */
    orderBy?: LobbyRankingOrderByWithRelationInput | LobbyRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LobbyRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LobbyRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LobbyRankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LobbyRankings
    **/
    _count?: true | LobbyRankingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LobbyRankingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LobbyRankingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LobbyRankingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LobbyRankingMaxAggregateInputType
  }

  export type GetLobbyRankingAggregateType<T extends LobbyRankingAggregateArgs> = {
        [P in keyof T & keyof AggregateLobbyRanking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLobbyRanking[P]>
      : GetScalarType<T[P], AggregateLobbyRanking[P]>
  }




  export type LobbyRankingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LobbyRankingWhereInput
    orderBy?: LobbyRankingOrderByWithAggregationInput | LobbyRankingOrderByWithAggregationInput[]
    by: LobbyRankingScalarFieldEnum[] | LobbyRankingScalarFieldEnum
    having?: LobbyRankingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LobbyRankingCountAggregateInputType | true
    _avg?: LobbyRankingAvgAggregateInputType
    _sum?: LobbyRankingSumAggregateInputType
    _min?: LobbyRankingMinAggregateInputType
    _max?: LobbyRankingMaxAggregateInputType
  }

  export type LobbyRankingGroupByOutputType = {
    id: string
    lobbyId: string
    whiteName: string | null
    blackName: string | null
    winner: string
    reasonCode: string
    reasonLabel: string
    scoreWhite: number
    scoreBlack: number
    durationSec: number
    startedAt: string
    endedAt: string
    recordedAt: string
    _count: LobbyRankingCountAggregateOutputType | null
    _avg: LobbyRankingAvgAggregateOutputType | null
    _sum: LobbyRankingSumAggregateOutputType | null
    _min: LobbyRankingMinAggregateOutputType | null
    _max: LobbyRankingMaxAggregateOutputType | null
  }

  type GetLobbyRankingGroupByPayload<T extends LobbyRankingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LobbyRankingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LobbyRankingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LobbyRankingGroupByOutputType[P]>
            : GetScalarType<T[P], LobbyRankingGroupByOutputType[P]>
        }
      >
    >


  export type LobbyRankingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lobbyId?: boolean
    whiteName?: boolean
    blackName?: boolean
    winner?: boolean
    reasonCode?: boolean
    reasonLabel?: boolean
    scoreWhite?: boolean
    scoreBlack?: boolean
    durationSec?: boolean
    startedAt?: boolean
    endedAt?: boolean
    recordedAt?: boolean
  }, ExtArgs["result"]["lobbyRanking"]>

  export type LobbyRankingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lobbyId?: boolean
    whiteName?: boolean
    blackName?: boolean
    winner?: boolean
    reasonCode?: boolean
    reasonLabel?: boolean
    scoreWhite?: boolean
    scoreBlack?: boolean
    durationSec?: boolean
    startedAt?: boolean
    endedAt?: boolean
    recordedAt?: boolean
  }, ExtArgs["result"]["lobbyRanking"]>

  export type LobbyRankingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lobbyId?: boolean
    whiteName?: boolean
    blackName?: boolean
    winner?: boolean
    reasonCode?: boolean
    reasonLabel?: boolean
    scoreWhite?: boolean
    scoreBlack?: boolean
    durationSec?: boolean
    startedAt?: boolean
    endedAt?: boolean
    recordedAt?: boolean
  }, ExtArgs["result"]["lobbyRanking"]>

  export type LobbyRankingSelectScalar = {
    id?: boolean
    lobbyId?: boolean
    whiteName?: boolean
    blackName?: boolean
    winner?: boolean
    reasonCode?: boolean
    reasonLabel?: boolean
    scoreWhite?: boolean
    scoreBlack?: boolean
    durationSec?: boolean
    startedAt?: boolean
    endedAt?: boolean
    recordedAt?: boolean
  }

  export type LobbyRankingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "lobbyId" | "whiteName" | "blackName" | "winner" | "reasonCode" | "reasonLabel" | "scoreWhite" | "scoreBlack" | "durationSec" | "startedAt" | "endedAt" | "recordedAt", ExtArgs["result"]["lobbyRanking"]>

  export type $LobbyRankingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LobbyRanking"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      lobbyId: string
      whiteName: string | null
      blackName: string | null
      winner: string
      reasonCode: string
      reasonLabel: string
      scoreWhite: number
      scoreBlack: number
      durationSec: number
      startedAt: string
      endedAt: string
      recordedAt: string
    }, ExtArgs["result"]["lobbyRanking"]>
    composites: {}
  }

  type LobbyRankingGetPayload<S extends boolean | null | undefined | LobbyRankingDefaultArgs> = $Result.GetResult<Prisma.$LobbyRankingPayload, S>

  type LobbyRankingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LobbyRankingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LobbyRankingCountAggregateInputType | true
    }

  export interface LobbyRankingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LobbyRanking'], meta: { name: 'LobbyRanking' } }
    /**
     * Find zero or one LobbyRanking that matches the filter.
     * @param {LobbyRankingFindUniqueArgs} args - Arguments to find a LobbyRanking
     * @example
     * // Get one LobbyRanking
     * const lobbyRanking = await prisma.lobbyRanking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LobbyRankingFindUniqueArgs>(args: SelectSubset<T, LobbyRankingFindUniqueArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LobbyRanking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LobbyRankingFindUniqueOrThrowArgs} args - Arguments to find a LobbyRanking
     * @example
     * // Get one LobbyRanking
     * const lobbyRanking = await prisma.lobbyRanking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LobbyRankingFindUniqueOrThrowArgs>(args: SelectSubset<T, LobbyRankingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LobbyRanking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LobbyRankingFindFirstArgs} args - Arguments to find a LobbyRanking
     * @example
     * // Get one LobbyRanking
     * const lobbyRanking = await prisma.lobbyRanking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LobbyRankingFindFirstArgs>(args?: SelectSubset<T, LobbyRankingFindFirstArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LobbyRanking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LobbyRankingFindFirstOrThrowArgs} args - Arguments to find a LobbyRanking
     * @example
     * // Get one LobbyRanking
     * const lobbyRanking = await prisma.lobbyRanking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LobbyRankingFindFirstOrThrowArgs>(args?: SelectSubset<T, LobbyRankingFindFirstOrThrowArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LobbyRankings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LobbyRankingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LobbyRankings
     * const lobbyRankings = await prisma.lobbyRanking.findMany()
     * 
     * // Get first 10 LobbyRankings
     * const lobbyRankings = await prisma.lobbyRanking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lobbyRankingWithIdOnly = await prisma.lobbyRanking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LobbyRankingFindManyArgs>(args?: SelectSubset<T, LobbyRankingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LobbyRanking.
     * @param {LobbyRankingCreateArgs} args - Arguments to create a LobbyRanking.
     * @example
     * // Create one LobbyRanking
     * const LobbyRanking = await prisma.lobbyRanking.create({
     *   data: {
     *     // ... data to create a LobbyRanking
     *   }
     * })
     * 
     */
    create<T extends LobbyRankingCreateArgs>(args: SelectSubset<T, LobbyRankingCreateArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LobbyRankings.
     * @param {LobbyRankingCreateManyArgs} args - Arguments to create many LobbyRankings.
     * @example
     * // Create many LobbyRankings
     * const lobbyRanking = await prisma.lobbyRanking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LobbyRankingCreateManyArgs>(args?: SelectSubset<T, LobbyRankingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LobbyRankings and returns the data saved in the database.
     * @param {LobbyRankingCreateManyAndReturnArgs} args - Arguments to create many LobbyRankings.
     * @example
     * // Create many LobbyRankings
     * const lobbyRanking = await prisma.lobbyRanking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LobbyRankings and only return the `id`
     * const lobbyRankingWithIdOnly = await prisma.lobbyRanking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LobbyRankingCreateManyAndReturnArgs>(args?: SelectSubset<T, LobbyRankingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LobbyRanking.
     * @param {LobbyRankingDeleteArgs} args - Arguments to delete one LobbyRanking.
     * @example
     * // Delete one LobbyRanking
     * const LobbyRanking = await prisma.lobbyRanking.delete({
     *   where: {
     *     // ... filter to delete one LobbyRanking
     *   }
     * })
     * 
     */
    delete<T extends LobbyRankingDeleteArgs>(args: SelectSubset<T, LobbyRankingDeleteArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LobbyRanking.
     * @param {LobbyRankingUpdateArgs} args - Arguments to update one LobbyRanking.
     * @example
     * // Update one LobbyRanking
     * const lobbyRanking = await prisma.lobbyRanking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LobbyRankingUpdateArgs>(args: SelectSubset<T, LobbyRankingUpdateArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LobbyRankings.
     * @param {LobbyRankingDeleteManyArgs} args - Arguments to filter LobbyRankings to delete.
     * @example
     * // Delete a few LobbyRankings
     * const { count } = await prisma.lobbyRanking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LobbyRankingDeleteManyArgs>(args?: SelectSubset<T, LobbyRankingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LobbyRankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LobbyRankingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LobbyRankings
     * const lobbyRanking = await prisma.lobbyRanking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LobbyRankingUpdateManyArgs>(args: SelectSubset<T, LobbyRankingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LobbyRankings and returns the data updated in the database.
     * @param {LobbyRankingUpdateManyAndReturnArgs} args - Arguments to update many LobbyRankings.
     * @example
     * // Update many LobbyRankings
     * const lobbyRanking = await prisma.lobbyRanking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LobbyRankings and only return the `id`
     * const lobbyRankingWithIdOnly = await prisma.lobbyRanking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LobbyRankingUpdateManyAndReturnArgs>(args: SelectSubset<T, LobbyRankingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LobbyRanking.
     * @param {LobbyRankingUpsertArgs} args - Arguments to update or create a LobbyRanking.
     * @example
     * // Update or create a LobbyRanking
     * const lobbyRanking = await prisma.lobbyRanking.upsert({
     *   create: {
     *     // ... data to create a LobbyRanking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LobbyRanking we want to update
     *   }
     * })
     */
    upsert<T extends LobbyRankingUpsertArgs>(args: SelectSubset<T, LobbyRankingUpsertArgs<ExtArgs>>): Prisma__LobbyRankingClient<$Result.GetResult<Prisma.$LobbyRankingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LobbyRankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LobbyRankingCountArgs} args - Arguments to filter LobbyRankings to count.
     * @example
     * // Count the number of LobbyRankings
     * const count = await prisma.lobbyRanking.count({
     *   where: {
     *     // ... the filter for the LobbyRankings we want to count
     *   }
     * })
    **/
    count<T extends LobbyRankingCountArgs>(
      args?: Subset<T, LobbyRankingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LobbyRankingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LobbyRanking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LobbyRankingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LobbyRankingAggregateArgs>(args: Subset<T, LobbyRankingAggregateArgs>): Prisma.PrismaPromise<GetLobbyRankingAggregateType<T>>

    /**
     * Group by LobbyRanking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LobbyRankingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LobbyRankingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LobbyRankingGroupByArgs['orderBy'] }
        : { orderBy?: LobbyRankingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LobbyRankingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLobbyRankingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LobbyRanking model
   */
  readonly fields: LobbyRankingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LobbyRanking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LobbyRankingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LobbyRanking model
   */
  interface LobbyRankingFieldRefs {
    readonly id: FieldRef<"LobbyRanking", 'String'>
    readonly lobbyId: FieldRef<"LobbyRanking", 'String'>
    readonly whiteName: FieldRef<"LobbyRanking", 'String'>
    readonly blackName: FieldRef<"LobbyRanking", 'String'>
    readonly winner: FieldRef<"LobbyRanking", 'String'>
    readonly reasonCode: FieldRef<"LobbyRanking", 'String'>
    readonly reasonLabel: FieldRef<"LobbyRanking", 'String'>
    readonly scoreWhite: FieldRef<"LobbyRanking", 'Float'>
    readonly scoreBlack: FieldRef<"LobbyRanking", 'Float'>
    readonly durationSec: FieldRef<"LobbyRanking", 'Int'>
    readonly startedAt: FieldRef<"LobbyRanking", 'String'>
    readonly endedAt: FieldRef<"LobbyRanking", 'String'>
    readonly recordedAt: FieldRef<"LobbyRanking", 'String'>
  }
    

  // Custom InputTypes
  /**
   * LobbyRanking findUnique
   */
  export type LobbyRankingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * Filter, which LobbyRanking to fetch.
     */
    where: LobbyRankingWhereUniqueInput
  }

  /**
   * LobbyRanking findUniqueOrThrow
   */
  export type LobbyRankingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * Filter, which LobbyRanking to fetch.
     */
    where: LobbyRankingWhereUniqueInput
  }

  /**
   * LobbyRanking findFirst
   */
  export type LobbyRankingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * Filter, which LobbyRanking to fetch.
     */
    where?: LobbyRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LobbyRankings to fetch.
     */
    orderBy?: LobbyRankingOrderByWithRelationInput | LobbyRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LobbyRankings.
     */
    cursor?: LobbyRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LobbyRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LobbyRankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LobbyRankings.
     */
    distinct?: LobbyRankingScalarFieldEnum | LobbyRankingScalarFieldEnum[]
  }

  /**
   * LobbyRanking findFirstOrThrow
   */
  export type LobbyRankingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * Filter, which LobbyRanking to fetch.
     */
    where?: LobbyRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LobbyRankings to fetch.
     */
    orderBy?: LobbyRankingOrderByWithRelationInput | LobbyRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LobbyRankings.
     */
    cursor?: LobbyRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LobbyRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LobbyRankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LobbyRankings.
     */
    distinct?: LobbyRankingScalarFieldEnum | LobbyRankingScalarFieldEnum[]
  }

  /**
   * LobbyRanking findMany
   */
  export type LobbyRankingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * Filter, which LobbyRankings to fetch.
     */
    where?: LobbyRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LobbyRankings to fetch.
     */
    orderBy?: LobbyRankingOrderByWithRelationInput | LobbyRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LobbyRankings.
     */
    cursor?: LobbyRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LobbyRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LobbyRankings.
     */
    skip?: number
    distinct?: LobbyRankingScalarFieldEnum | LobbyRankingScalarFieldEnum[]
  }

  /**
   * LobbyRanking create
   */
  export type LobbyRankingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * The data needed to create a LobbyRanking.
     */
    data: XOR<LobbyRankingCreateInput, LobbyRankingUncheckedCreateInput>
  }

  /**
   * LobbyRanking createMany
   */
  export type LobbyRankingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LobbyRankings.
     */
    data: LobbyRankingCreateManyInput | LobbyRankingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LobbyRanking createManyAndReturn
   */
  export type LobbyRankingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * The data used to create many LobbyRankings.
     */
    data: LobbyRankingCreateManyInput | LobbyRankingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LobbyRanking update
   */
  export type LobbyRankingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * The data needed to update a LobbyRanking.
     */
    data: XOR<LobbyRankingUpdateInput, LobbyRankingUncheckedUpdateInput>
    /**
     * Choose, which LobbyRanking to update.
     */
    where: LobbyRankingWhereUniqueInput
  }

  /**
   * LobbyRanking updateMany
   */
  export type LobbyRankingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LobbyRankings.
     */
    data: XOR<LobbyRankingUpdateManyMutationInput, LobbyRankingUncheckedUpdateManyInput>
    /**
     * Filter which LobbyRankings to update
     */
    where?: LobbyRankingWhereInput
    /**
     * Limit how many LobbyRankings to update.
     */
    limit?: number
  }

  /**
   * LobbyRanking updateManyAndReturn
   */
  export type LobbyRankingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * The data used to update LobbyRankings.
     */
    data: XOR<LobbyRankingUpdateManyMutationInput, LobbyRankingUncheckedUpdateManyInput>
    /**
     * Filter which LobbyRankings to update
     */
    where?: LobbyRankingWhereInput
    /**
     * Limit how many LobbyRankings to update.
     */
    limit?: number
  }

  /**
   * LobbyRanking upsert
   */
  export type LobbyRankingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * The filter to search for the LobbyRanking to update in case it exists.
     */
    where: LobbyRankingWhereUniqueInput
    /**
     * In case the LobbyRanking found by the `where` argument doesn't exist, create a new LobbyRanking with this data.
     */
    create: XOR<LobbyRankingCreateInput, LobbyRankingUncheckedCreateInput>
    /**
     * In case the LobbyRanking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LobbyRankingUpdateInput, LobbyRankingUncheckedUpdateInput>
  }

  /**
   * LobbyRanking delete
   */
  export type LobbyRankingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
    /**
     * Filter which LobbyRanking to delete.
     */
    where: LobbyRankingWhereUniqueInput
  }

  /**
   * LobbyRanking deleteMany
   */
  export type LobbyRankingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LobbyRankings to delete
     */
    where?: LobbyRankingWhereInput
    /**
     * Limit how many LobbyRankings to delete.
     */
    limit?: number
  }

  /**
   * LobbyRanking without action
   */
  export type LobbyRankingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LobbyRanking
     */
    select?: LobbyRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LobbyRanking
     */
    omit?: LobbyRankingOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TdLearningScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    tdError: 'tdError',
    vBefore: 'vBefore',
    vAfter: 'vAfter',
    tdTarget: 'tdTarget',
    terminal: 'terminal',
    outcomeForMover: 'outcomeForMover',
    updates: 'updates'
  };

  export type TdLearningScalarFieldEnum = (typeof TdLearningScalarFieldEnum)[keyof typeof TdLearningScalarFieldEnum]


  export const NnWeightsSnapshotScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updates: 'updates',
    payload: 'payload'
  };

  export type NnWeightsSnapshotScalarFieldEnum = (typeof NnWeightsSnapshotScalarFieldEnum)[keyof typeof NnWeightsSnapshotScalarFieldEnum]


  export const GameReplayScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    result: 'result',
    fen: 'fen',
    pgn: 'pgn',
    movesJson: 'movesJson',
    metaJson: 'metaJson'
  };

  export type GameReplayScalarFieldEnum = (typeof GameReplayScalarFieldEnum)[keyof typeof GameReplayScalarFieldEnum]


  export const ReplayBufferRowScalarFieldEnum: {
    id: 'id',
    replayId: 'replayId',
    createdAt: 'createdAt',
    result: 'result',
    ply: 'ply',
    fen: 'fen'
  };

  export type ReplayBufferRowScalarFieldEnum = (typeof ReplayBufferRowScalarFieldEnum)[keyof typeof ReplayBufferRowScalarFieldEnum]


  export const LobbyRankingScalarFieldEnum: {
    id: 'id',
    lobbyId: 'lobbyId',
    whiteName: 'whiteName',
    blackName: 'blackName',
    winner: 'winner',
    reasonCode: 'reasonCode',
    reasonLabel: 'reasonLabel',
    scoreWhite: 'scoreWhite',
    scoreBlack: 'scoreBlack',
    durationSec: 'durationSec',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
    recordedAt: 'recordedAt'
  };

  export type LobbyRankingScalarFieldEnum = (typeof LobbyRankingScalarFieldEnum)[keyof typeof LobbyRankingScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TdLearningWhereInput = {
    AND?: TdLearningWhereInput | TdLearningWhereInput[]
    OR?: TdLearningWhereInput[]
    NOT?: TdLearningWhereInput | TdLearningWhereInput[]
    id?: IntFilter<"TdLearning"> | number
    createdAt?: StringFilter<"TdLearning"> | string
    tdError?: FloatNullableFilter<"TdLearning"> | number | null
    vBefore?: FloatNullableFilter<"TdLearning"> | number | null
    vAfter?: FloatNullableFilter<"TdLearning"> | number | null
    tdTarget?: FloatNullableFilter<"TdLearning"> | number | null
    terminal?: IntFilter<"TdLearning"> | number
    outcomeForMover?: IntFilter<"TdLearning"> | number
    updates?: IntFilter<"TdLearning"> | number
  }

  export type TdLearningOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tdError?: SortOrderInput | SortOrder
    vBefore?: SortOrderInput | SortOrder
    vAfter?: SortOrderInput | SortOrder
    tdTarget?: SortOrderInput | SortOrder
    terminal?: SortOrder
    outcomeForMover?: SortOrder
    updates?: SortOrder
  }

  export type TdLearningWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TdLearningWhereInput | TdLearningWhereInput[]
    OR?: TdLearningWhereInput[]
    NOT?: TdLearningWhereInput | TdLearningWhereInput[]
    createdAt?: StringFilter<"TdLearning"> | string
    tdError?: FloatNullableFilter<"TdLearning"> | number | null
    vBefore?: FloatNullableFilter<"TdLearning"> | number | null
    vAfter?: FloatNullableFilter<"TdLearning"> | number | null
    tdTarget?: FloatNullableFilter<"TdLearning"> | number | null
    terminal?: IntFilter<"TdLearning"> | number
    outcomeForMover?: IntFilter<"TdLearning"> | number
    updates?: IntFilter<"TdLearning"> | number
  }, "id">

  export type TdLearningOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tdError?: SortOrderInput | SortOrder
    vBefore?: SortOrderInput | SortOrder
    vAfter?: SortOrderInput | SortOrder
    tdTarget?: SortOrderInput | SortOrder
    terminal?: SortOrder
    outcomeForMover?: SortOrder
    updates?: SortOrder
    _count?: TdLearningCountOrderByAggregateInput
    _avg?: TdLearningAvgOrderByAggregateInput
    _max?: TdLearningMaxOrderByAggregateInput
    _min?: TdLearningMinOrderByAggregateInput
    _sum?: TdLearningSumOrderByAggregateInput
  }

  export type TdLearningScalarWhereWithAggregatesInput = {
    AND?: TdLearningScalarWhereWithAggregatesInput | TdLearningScalarWhereWithAggregatesInput[]
    OR?: TdLearningScalarWhereWithAggregatesInput[]
    NOT?: TdLearningScalarWhereWithAggregatesInput | TdLearningScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"TdLearning"> | number
    createdAt?: StringWithAggregatesFilter<"TdLearning"> | string
    tdError?: FloatNullableWithAggregatesFilter<"TdLearning"> | number | null
    vBefore?: FloatNullableWithAggregatesFilter<"TdLearning"> | number | null
    vAfter?: FloatNullableWithAggregatesFilter<"TdLearning"> | number | null
    tdTarget?: FloatNullableWithAggregatesFilter<"TdLearning"> | number | null
    terminal?: IntWithAggregatesFilter<"TdLearning"> | number
    outcomeForMover?: IntWithAggregatesFilter<"TdLearning"> | number
    updates?: IntWithAggregatesFilter<"TdLearning"> | number
  }

  export type NnWeightsSnapshotWhereInput = {
    AND?: NnWeightsSnapshotWhereInput | NnWeightsSnapshotWhereInput[]
    OR?: NnWeightsSnapshotWhereInput[]
    NOT?: NnWeightsSnapshotWhereInput | NnWeightsSnapshotWhereInput[]
    id?: IntFilter<"NnWeightsSnapshot"> | number
    createdAt?: StringFilter<"NnWeightsSnapshot"> | string
    updates?: IntFilter<"NnWeightsSnapshot"> | number
    payload?: StringFilter<"NnWeightsSnapshot"> | string
  }

  export type NnWeightsSnapshotOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updates?: SortOrder
    payload?: SortOrder
  }

  export type NnWeightsSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: NnWeightsSnapshotWhereInput | NnWeightsSnapshotWhereInput[]
    OR?: NnWeightsSnapshotWhereInput[]
    NOT?: NnWeightsSnapshotWhereInput | NnWeightsSnapshotWhereInput[]
    createdAt?: StringFilter<"NnWeightsSnapshot"> | string
    updates?: IntFilter<"NnWeightsSnapshot"> | number
    payload?: StringFilter<"NnWeightsSnapshot"> | string
  }, "id">

  export type NnWeightsSnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updates?: SortOrder
    payload?: SortOrder
    _count?: NnWeightsSnapshotCountOrderByAggregateInput
    _avg?: NnWeightsSnapshotAvgOrderByAggregateInput
    _max?: NnWeightsSnapshotMaxOrderByAggregateInput
    _min?: NnWeightsSnapshotMinOrderByAggregateInput
    _sum?: NnWeightsSnapshotSumOrderByAggregateInput
  }

  export type NnWeightsSnapshotScalarWhereWithAggregatesInput = {
    AND?: NnWeightsSnapshotScalarWhereWithAggregatesInput | NnWeightsSnapshotScalarWhereWithAggregatesInput[]
    OR?: NnWeightsSnapshotScalarWhereWithAggregatesInput[]
    NOT?: NnWeightsSnapshotScalarWhereWithAggregatesInput | NnWeightsSnapshotScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"NnWeightsSnapshot"> | number
    createdAt?: StringWithAggregatesFilter<"NnWeightsSnapshot"> | string
    updates?: IntWithAggregatesFilter<"NnWeightsSnapshot"> | number
    payload?: StringWithAggregatesFilter<"NnWeightsSnapshot"> | string
  }

  export type GameReplayWhereInput = {
    AND?: GameReplayWhereInput | GameReplayWhereInput[]
    OR?: GameReplayWhereInput[]
    NOT?: GameReplayWhereInput | GameReplayWhereInput[]
    id?: StringFilter<"GameReplay"> | string
    createdAt?: StringFilter<"GameReplay"> | string
    result?: StringFilter<"GameReplay"> | string
    fen?: StringNullableFilter<"GameReplay"> | string | null
    pgn?: StringNullableFilter<"GameReplay"> | string | null
    movesJson?: StringFilter<"GameReplay"> | string
    metaJson?: StringFilter<"GameReplay"> | string
    bufferRows?: ReplayBufferRowListRelationFilter
  }

  export type GameReplayOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    fen?: SortOrderInput | SortOrder
    pgn?: SortOrderInput | SortOrder
    movesJson?: SortOrder
    metaJson?: SortOrder
    bufferRows?: ReplayBufferRowOrderByRelationAggregateInput
  }

  export type GameReplayWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GameReplayWhereInput | GameReplayWhereInput[]
    OR?: GameReplayWhereInput[]
    NOT?: GameReplayWhereInput | GameReplayWhereInput[]
    createdAt?: StringFilter<"GameReplay"> | string
    result?: StringFilter<"GameReplay"> | string
    fen?: StringNullableFilter<"GameReplay"> | string | null
    pgn?: StringNullableFilter<"GameReplay"> | string | null
    movesJson?: StringFilter<"GameReplay"> | string
    metaJson?: StringFilter<"GameReplay"> | string
    bufferRows?: ReplayBufferRowListRelationFilter
  }, "id">

  export type GameReplayOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    fen?: SortOrderInput | SortOrder
    pgn?: SortOrderInput | SortOrder
    movesJson?: SortOrder
    metaJson?: SortOrder
    _count?: GameReplayCountOrderByAggregateInput
    _max?: GameReplayMaxOrderByAggregateInput
    _min?: GameReplayMinOrderByAggregateInput
  }

  export type GameReplayScalarWhereWithAggregatesInput = {
    AND?: GameReplayScalarWhereWithAggregatesInput | GameReplayScalarWhereWithAggregatesInput[]
    OR?: GameReplayScalarWhereWithAggregatesInput[]
    NOT?: GameReplayScalarWhereWithAggregatesInput | GameReplayScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GameReplay"> | string
    createdAt?: StringWithAggregatesFilter<"GameReplay"> | string
    result?: StringWithAggregatesFilter<"GameReplay"> | string
    fen?: StringNullableWithAggregatesFilter<"GameReplay"> | string | null
    pgn?: StringNullableWithAggregatesFilter<"GameReplay"> | string | null
    movesJson?: StringWithAggregatesFilter<"GameReplay"> | string
    metaJson?: StringWithAggregatesFilter<"GameReplay"> | string
  }

  export type ReplayBufferRowWhereInput = {
    AND?: ReplayBufferRowWhereInput | ReplayBufferRowWhereInput[]
    OR?: ReplayBufferRowWhereInput[]
    NOT?: ReplayBufferRowWhereInput | ReplayBufferRowWhereInput[]
    id?: IntFilter<"ReplayBufferRow"> | number
    replayId?: StringFilter<"ReplayBufferRow"> | string
    createdAt?: StringFilter<"ReplayBufferRow"> | string
    result?: StringFilter<"ReplayBufferRow"> | string
    ply?: IntFilter<"ReplayBufferRow"> | number
    fen?: StringFilter<"ReplayBufferRow"> | string
    replay?: XOR<GameReplayScalarRelationFilter, GameReplayWhereInput>
  }

  export type ReplayBufferRowOrderByWithRelationInput = {
    id?: SortOrder
    replayId?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    ply?: SortOrder
    fen?: SortOrder
    replay?: GameReplayOrderByWithRelationInput
  }

  export type ReplayBufferRowWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ReplayBufferRowWhereInput | ReplayBufferRowWhereInput[]
    OR?: ReplayBufferRowWhereInput[]
    NOT?: ReplayBufferRowWhereInput | ReplayBufferRowWhereInput[]
    replayId?: StringFilter<"ReplayBufferRow"> | string
    createdAt?: StringFilter<"ReplayBufferRow"> | string
    result?: StringFilter<"ReplayBufferRow"> | string
    ply?: IntFilter<"ReplayBufferRow"> | number
    fen?: StringFilter<"ReplayBufferRow"> | string
    replay?: XOR<GameReplayScalarRelationFilter, GameReplayWhereInput>
  }, "id">

  export type ReplayBufferRowOrderByWithAggregationInput = {
    id?: SortOrder
    replayId?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    ply?: SortOrder
    fen?: SortOrder
    _count?: ReplayBufferRowCountOrderByAggregateInput
    _avg?: ReplayBufferRowAvgOrderByAggregateInput
    _max?: ReplayBufferRowMaxOrderByAggregateInput
    _min?: ReplayBufferRowMinOrderByAggregateInput
    _sum?: ReplayBufferRowSumOrderByAggregateInput
  }

  export type ReplayBufferRowScalarWhereWithAggregatesInput = {
    AND?: ReplayBufferRowScalarWhereWithAggregatesInput | ReplayBufferRowScalarWhereWithAggregatesInput[]
    OR?: ReplayBufferRowScalarWhereWithAggregatesInput[]
    NOT?: ReplayBufferRowScalarWhereWithAggregatesInput | ReplayBufferRowScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ReplayBufferRow"> | number
    replayId?: StringWithAggregatesFilter<"ReplayBufferRow"> | string
    createdAt?: StringWithAggregatesFilter<"ReplayBufferRow"> | string
    result?: StringWithAggregatesFilter<"ReplayBufferRow"> | string
    ply?: IntWithAggregatesFilter<"ReplayBufferRow"> | number
    fen?: StringWithAggregatesFilter<"ReplayBufferRow"> | string
  }

  export type LobbyRankingWhereInput = {
    AND?: LobbyRankingWhereInput | LobbyRankingWhereInput[]
    OR?: LobbyRankingWhereInput[]
    NOT?: LobbyRankingWhereInput | LobbyRankingWhereInput[]
    id?: StringFilter<"LobbyRanking"> | string
    lobbyId?: StringFilter<"LobbyRanking"> | string
    whiteName?: StringNullableFilter<"LobbyRanking"> | string | null
    blackName?: StringNullableFilter<"LobbyRanking"> | string | null
    winner?: StringFilter<"LobbyRanking"> | string
    reasonCode?: StringFilter<"LobbyRanking"> | string
    reasonLabel?: StringFilter<"LobbyRanking"> | string
    scoreWhite?: FloatFilter<"LobbyRanking"> | number
    scoreBlack?: FloatFilter<"LobbyRanking"> | number
    durationSec?: IntFilter<"LobbyRanking"> | number
    startedAt?: StringFilter<"LobbyRanking"> | string
    endedAt?: StringFilter<"LobbyRanking"> | string
    recordedAt?: StringFilter<"LobbyRanking"> | string
  }

  export type LobbyRankingOrderByWithRelationInput = {
    id?: SortOrder
    lobbyId?: SortOrder
    whiteName?: SortOrderInput | SortOrder
    blackName?: SortOrderInput | SortOrder
    winner?: SortOrder
    reasonCode?: SortOrder
    reasonLabel?: SortOrder
    scoreWhite?: SortOrder
    scoreBlack?: SortOrder
    durationSec?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    recordedAt?: SortOrder
  }

  export type LobbyRankingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LobbyRankingWhereInput | LobbyRankingWhereInput[]
    OR?: LobbyRankingWhereInput[]
    NOT?: LobbyRankingWhereInput | LobbyRankingWhereInput[]
    lobbyId?: StringFilter<"LobbyRanking"> | string
    whiteName?: StringNullableFilter<"LobbyRanking"> | string | null
    blackName?: StringNullableFilter<"LobbyRanking"> | string | null
    winner?: StringFilter<"LobbyRanking"> | string
    reasonCode?: StringFilter<"LobbyRanking"> | string
    reasonLabel?: StringFilter<"LobbyRanking"> | string
    scoreWhite?: FloatFilter<"LobbyRanking"> | number
    scoreBlack?: FloatFilter<"LobbyRanking"> | number
    durationSec?: IntFilter<"LobbyRanking"> | number
    startedAt?: StringFilter<"LobbyRanking"> | string
    endedAt?: StringFilter<"LobbyRanking"> | string
    recordedAt?: StringFilter<"LobbyRanking"> | string
  }, "id">

  export type LobbyRankingOrderByWithAggregationInput = {
    id?: SortOrder
    lobbyId?: SortOrder
    whiteName?: SortOrderInput | SortOrder
    blackName?: SortOrderInput | SortOrder
    winner?: SortOrder
    reasonCode?: SortOrder
    reasonLabel?: SortOrder
    scoreWhite?: SortOrder
    scoreBlack?: SortOrder
    durationSec?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    recordedAt?: SortOrder
    _count?: LobbyRankingCountOrderByAggregateInput
    _avg?: LobbyRankingAvgOrderByAggregateInput
    _max?: LobbyRankingMaxOrderByAggregateInput
    _min?: LobbyRankingMinOrderByAggregateInput
    _sum?: LobbyRankingSumOrderByAggregateInput
  }

  export type LobbyRankingScalarWhereWithAggregatesInput = {
    AND?: LobbyRankingScalarWhereWithAggregatesInput | LobbyRankingScalarWhereWithAggregatesInput[]
    OR?: LobbyRankingScalarWhereWithAggregatesInput[]
    NOT?: LobbyRankingScalarWhereWithAggregatesInput | LobbyRankingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LobbyRanking"> | string
    lobbyId?: StringWithAggregatesFilter<"LobbyRanking"> | string
    whiteName?: StringNullableWithAggregatesFilter<"LobbyRanking"> | string | null
    blackName?: StringNullableWithAggregatesFilter<"LobbyRanking"> | string | null
    winner?: StringWithAggregatesFilter<"LobbyRanking"> | string
    reasonCode?: StringWithAggregatesFilter<"LobbyRanking"> | string
    reasonLabel?: StringWithAggregatesFilter<"LobbyRanking"> | string
    scoreWhite?: FloatWithAggregatesFilter<"LobbyRanking"> | number
    scoreBlack?: FloatWithAggregatesFilter<"LobbyRanking"> | number
    durationSec?: IntWithAggregatesFilter<"LobbyRanking"> | number
    startedAt?: StringWithAggregatesFilter<"LobbyRanking"> | string
    endedAt?: StringWithAggregatesFilter<"LobbyRanking"> | string
    recordedAt?: StringWithAggregatesFilter<"LobbyRanking"> | string
  }

  export type TdLearningCreateInput = {
    createdAt: string
    tdError?: number | null
    vBefore?: number | null
    vAfter?: number | null
    tdTarget?: number | null
    terminal: number
    outcomeForMover: number
    updates: number
  }

  export type TdLearningUncheckedCreateInput = {
    id?: number
    createdAt: string
    tdError?: number | null
    vBefore?: number | null
    vAfter?: number | null
    tdTarget?: number | null
    terminal: number
    outcomeForMover: number
    updates: number
  }

  export type TdLearningUpdateInput = {
    createdAt?: StringFieldUpdateOperationsInput | string
    tdError?: NullableFloatFieldUpdateOperationsInput | number | null
    vBefore?: NullableFloatFieldUpdateOperationsInput | number | null
    vAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    tdTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    terminal?: IntFieldUpdateOperationsInput | number
    outcomeForMover?: IntFieldUpdateOperationsInput | number
    updates?: IntFieldUpdateOperationsInput | number
  }

  export type TdLearningUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    tdError?: NullableFloatFieldUpdateOperationsInput | number | null
    vBefore?: NullableFloatFieldUpdateOperationsInput | number | null
    vAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    tdTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    terminal?: IntFieldUpdateOperationsInput | number
    outcomeForMover?: IntFieldUpdateOperationsInput | number
    updates?: IntFieldUpdateOperationsInput | number
  }

  export type TdLearningCreateManyInput = {
    id?: number
    createdAt: string
    tdError?: number | null
    vBefore?: number | null
    vAfter?: number | null
    tdTarget?: number | null
    terminal: number
    outcomeForMover: number
    updates: number
  }

  export type TdLearningUpdateManyMutationInput = {
    createdAt?: StringFieldUpdateOperationsInput | string
    tdError?: NullableFloatFieldUpdateOperationsInput | number | null
    vBefore?: NullableFloatFieldUpdateOperationsInput | number | null
    vAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    tdTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    terminal?: IntFieldUpdateOperationsInput | number
    outcomeForMover?: IntFieldUpdateOperationsInput | number
    updates?: IntFieldUpdateOperationsInput | number
  }

  export type TdLearningUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    tdError?: NullableFloatFieldUpdateOperationsInput | number | null
    vBefore?: NullableFloatFieldUpdateOperationsInput | number | null
    vAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    tdTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    terminal?: IntFieldUpdateOperationsInput | number
    outcomeForMover?: IntFieldUpdateOperationsInput | number
    updates?: IntFieldUpdateOperationsInput | number
  }

  export type NnWeightsSnapshotCreateInput = {
    createdAt: string
    updates: number
    payload: string
  }

  export type NnWeightsSnapshotUncheckedCreateInput = {
    id?: number
    createdAt: string
    updates: number
    payload: string
  }

  export type NnWeightsSnapshotUpdateInput = {
    createdAt?: StringFieldUpdateOperationsInput | string
    updates?: IntFieldUpdateOperationsInput | number
    payload?: StringFieldUpdateOperationsInput | string
  }

  export type NnWeightsSnapshotUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    updates?: IntFieldUpdateOperationsInput | number
    payload?: StringFieldUpdateOperationsInput | string
  }

  export type NnWeightsSnapshotCreateManyInput = {
    id?: number
    createdAt: string
    updates: number
    payload: string
  }

  export type NnWeightsSnapshotUpdateManyMutationInput = {
    createdAt?: StringFieldUpdateOperationsInput | string
    updates?: IntFieldUpdateOperationsInput | number
    payload?: StringFieldUpdateOperationsInput | string
  }

  export type NnWeightsSnapshotUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    updates?: IntFieldUpdateOperationsInput | number
    payload?: StringFieldUpdateOperationsInput | string
  }

  export type GameReplayCreateInput = {
    id: string
    createdAt: string
    result: string
    fen?: string | null
    pgn?: string | null
    movesJson: string
    metaJson: string
    bufferRows?: ReplayBufferRowCreateNestedManyWithoutReplayInput
  }

  export type GameReplayUncheckedCreateInput = {
    id: string
    createdAt: string
    result: string
    fen?: string | null
    pgn?: string | null
    movesJson: string
    metaJson: string
    bufferRows?: ReplayBufferRowUncheckedCreateNestedManyWithoutReplayInput
  }

  export type GameReplayUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    fen?: NullableStringFieldUpdateOperationsInput | string | null
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    movesJson?: StringFieldUpdateOperationsInput | string
    metaJson?: StringFieldUpdateOperationsInput | string
    bufferRows?: ReplayBufferRowUpdateManyWithoutReplayNestedInput
  }

  export type GameReplayUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    fen?: NullableStringFieldUpdateOperationsInput | string | null
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    movesJson?: StringFieldUpdateOperationsInput | string
    metaJson?: StringFieldUpdateOperationsInput | string
    bufferRows?: ReplayBufferRowUncheckedUpdateManyWithoutReplayNestedInput
  }

  export type GameReplayCreateManyInput = {
    id: string
    createdAt: string
    result: string
    fen?: string | null
    pgn?: string | null
    movesJson: string
    metaJson: string
  }

  export type GameReplayUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    fen?: NullableStringFieldUpdateOperationsInput | string | null
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    movesJson?: StringFieldUpdateOperationsInput | string
    metaJson?: StringFieldUpdateOperationsInput | string
  }

  export type GameReplayUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    fen?: NullableStringFieldUpdateOperationsInput | string | null
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    movesJson?: StringFieldUpdateOperationsInput | string
    metaJson?: StringFieldUpdateOperationsInput | string
  }

  export type ReplayBufferRowCreateInput = {
    createdAt: string
    result: string
    ply: number
    fen: string
    replay: GameReplayCreateNestedOneWithoutBufferRowsInput
  }

  export type ReplayBufferRowUncheckedCreateInput = {
    id?: number
    replayId: string
    createdAt: string
    result: string
    ply: number
    fen: string
  }

  export type ReplayBufferRowUpdateInput = {
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    ply?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
    replay?: GameReplayUpdateOneRequiredWithoutBufferRowsNestedInput
  }

  export type ReplayBufferRowUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    replayId?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    ply?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
  }

  export type ReplayBufferRowCreateManyInput = {
    id?: number
    replayId: string
    createdAt: string
    result: string
    ply: number
    fen: string
  }

  export type ReplayBufferRowUpdateManyMutationInput = {
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    ply?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
  }

  export type ReplayBufferRowUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    replayId?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    ply?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
  }

  export type LobbyRankingCreateInput = {
    id?: string
    lobbyId: string
    whiteName?: string | null
    blackName?: string | null
    winner: string
    reasonCode: string
    reasonLabel: string
    scoreWhite: number
    scoreBlack: number
    durationSec: number
    startedAt: string
    endedAt: string
    recordedAt: string
  }

  export type LobbyRankingUncheckedCreateInput = {
    id?: string
    lobbyId: string
    whiteName?: string | null
    blackName?: string | null
    winner: string
    reasonCode: string
    reasonLabel: string
    scoreWhite: number
    scoreBlack: number
    durationSec: number
    startedAt: string
    endedAt: string
    recordedAt: string
  }

  export type LobbyRankingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lobbyId?: StringFieldUpdateOperationsInput | string
    whiteName?: NullableStringFieldUpdateOperationsInput | string | null
    blackName?: NullableStringFieldUpdateOperationsInput | string | null
    winner?: StringFieldUpdateOperationsInput | string
    reasonCode?: StringFieldUpdateOperationsInput | string
    reasonLabel?: StringFieldUpdateOperationsInput | string
    scoreWhite?: FloatFieldUpdateOperationsInput | number
    scoreBlack?: FloatFieldUpdateOperationsInput | number
    durationSec?: IntFieldUpdateOperationsInput | number
    startedAt?: StringFieldUpdateOperationsInput | string
    endedAt?: StringFieldUpdateOperationsInput | string
    recordedAt?: StringFieldUpdateOperationsInput | string
  }

  export type LobbyRankingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lobbyId?: StringFieldUpdateOperationsInput | string
    whiteName?: NullableStringFieldUpdateOperationsInput | string | null
    blackName?: NullableStringFieldUpdateOperationsInput | string | null
    winner?: StringFieldUpdateOperationsInput | string
    reasonCode?: StringFieldUpdateOperationsInput | string
    reasonLabel?: StringFieldUpdateOperationsInput | string
    scoreWhite?: FloatFieldUpdateOperationsInput | number
    scoreBlack?: FloatFieldUpdateOperationsInput | number
    durationSec?: IntFieldUpdateOperationsInput | number
    startedAt?: StringFieldUpdateOperationsInput | string
    endedAt?: StringFieldUpdateOperationsInput | string
    recordedAt?: StringFieldUpdateOperationsInput | string
  }

  export type LobbyRankingCreateManyInput = {
    id?: string
    lobbyId: string
    whiteName?: string | null
    blackName?: string | null
    winner: string
    reasonCode: string
    reasonLabel: string
    scoreWhite: number
    scoreBlack: number
    durationSec: number
    startedAt: string
    endedAt: string
    recordedAt: string
  }

  export type LobbyRankingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    lobbyId?: StringFieldUpdateOperationsInput | string
    whiteName?: NullableStringFieldUpdateOperationsInput | string | null
    blackName?: NullableStringFieldUpdateOperationsInput | string | null
    winner?: StringFieldUpdateOperationsInput | string
    reasonCode?: StringFieldUpdateOperationsInput | string
    reasonLabel?: StringFieldUpdateOperationsInput | string
    scoreWhite?: FloatFieldUpdateOperationsInput | number
    scoreBlack?: FloatFieldUpdateOperationsInput | number
    durationSec?: IntFieldUpdateOperationsInput | number
    startedAt?: StringFieldUpdateOperationsInput | string
    endedAt?: StringFieldUpdateOperationsInput | string
    recordedAt?: StringFieldUpdateOperationsInput | string
  }

  export type LobbyRankingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    lobbyId?: StringFieldUpdateOperationsInput | string
    whiteName?: NullableStringFieldUpdateOperationsInput | string | null
    blackName?: NullableStringFieldUpdateOperationsInput | string | null
    winner?: StringFieldUpdateOperationsInput | string
    reasonCode?: StringFieldUpdateOperationsInput | string
    reasonLabel?: StringFieldUpdateOperationsInput | string
    scoreWhite?: FloatFieldUpdateOperationsInput | number
    scoreBlack?: FloatFieldUpdateOperationsInput | number
    durationSec?: IntFieldUpdateOperationsInput | number
    startedAt?: StringFieldUpdateOperationsInput | string
    endedAt?: StringFieldUpdateOperationsInput | string
    recordedAt?: StringFieldUpdateOperationsInput | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TdLearningCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tdError?: SortOrder
    vBefore?: SortOrder
    vAfter?: SortOrder
    tdTarget?: SortOrder
    terminal?: SortOrder
    outcomeForMover?: SortOrder
    updates?: SortOrder
  }

  export type TdLearningAvgOrderByAggregateInput = {
    id?: SortOrder
    tdError?: SortOrder
    vBefore?: SortOrder
    vAfter?: SortOrder
    tdTarget?: SortOrder
    terminal?: SortOrder
    outcomeForMover?: SortOrder
    updates?: SortOrder
  }

  export type TdLearningMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tdError?: SortOrder
    vBefore?: SortOrder
    vAfter?: SortOrder
    tdTarget?: SortOrder
    terminal?: SortOrder
    outcomeForMover?: SortOrder
    updates?: SortOrder
  }

  export type TdLearningMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tdError?: SortOrder
    vBefore?: SortOrder
    vAfter?: SortOrder
    tdTarget?: SortOrder
    terminal?: SortOrder
    outcomeForMover?: SortOrder
    updates?: SortOrder
  }

  export type TdLearningSumOrderByAggregateInput = {
    id?: SortOrder
    tdError?: SortOrder
    vBefore?: SortOrder
    vAfter?: SortOrder
    tdTarget?: SortOrder
    terminal?: SortOrder
    outcomeForMover?: SortOrder
    updates?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NnWeightsSnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updates?: SortOrder
    payload?: SortOrder
  }

  export type NnWeightsSnapshotAvgOrderByAggregateInput = {
    id?: SortOrder
    updates?: SortOrder
  }

  export type NnWeightsSnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updates?: SortOrder
    payload?: SortOrder
  }

  export type NnWeightsSnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updates?: SortOrder
    payload?: SortOrder
  }

  export type NnWeightsSnapshotSumOrderByAggregateInput = {
    id?: SortOrder
    updates?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type ReplayBufferRowListRelationFilter = {
    every?: ReplayBufferRowWhereInput
    some?: ReplayBufferRowWhereInput
    none?: ReplayBufferRowWhereInput
  }

  export type ReplayBufferRowOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GameReplayCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    fen?: SortOrder
    pgn?: SortOrder
    movesJson?: SortOrder
    metaJson?: SortOrder
  }

  export type GameReplayMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    fen?: SortOrder
    pgn?: SortOrder
    movesJson?: SortOrder
    metaJson?: SortOrder
  }

  export type GameReplayMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    fen?: SortOrder
    pgn?: SortOrder
    movesJson?: SortOrder
    metaJson?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type GameReplayScalarRelationFilter = {
    is?: GameReplayWhereInput
    isNot?: GameReplayWhereInput
  }

  export type ReplayBufferRowCountOrderByAggregateInput = {
    id?: SortOrder
    replayId?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    ply?: SortOrder
    fen?: SortOrder
  }

  export type ReplayBufferRowAvgOrderByAggregateInput = {
    id?: SortOrder
    ply?: SortOrder
  }

  export type ReplayBufferRowMaxOrderByAggregateInput = {
    id?: SortOrder
    replayId?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    ply?: SortOrder
    fen?: SortOrder
  }

  export type ReplayBufferRowMinOrderByAggregateInput = {
    id?: SortOrder
    replayId?: SortOrder
    createdAt?: SortOrder
    result?: SortOrder
    ply?: SortOrder
    fen?: SortOrder
  }

  export type ReplayBufferRowSumOrderByAggregateInput = {
    id?: SortOrder
    ply?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type LobbyRankingCountOrderByAggregateInput = {
    id?: SortOrder
    lobbyId?: SortOrder
    whiteName?: SortOrder
    blackName?: SortOrder
    winner?: SortOrder
    reasonCode?: SortOrder
    reasonLabel?: SortOrder
    scoreWhite?: SortOrder
    scoreBlack?: SortOrder
    durationSec?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    recordedAt?: SortOrder
  }

  export type LobbyRankingAvgOrderByAggregateInput = {
    scoreWhite?: SortOrder
    scoreBlack?: SortOrder
    durationSec?: SortOrder
  }

  export type LobbyRankingMaxOrderByAggregateInput = {
    id?: SortOrder
    lobbyId?: SortOrder
    whiteName?: SortOrder
    blackName?: SortOrder
    winner?: SortOrder
    reasonCode?: SortOrder
    reasonLabel?: SortOrder
    scoreWhite?: SortOrder
    scoreBlack?: SortOrder
    durationSec?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    recordedAt?: SortOrder
  }

  export type LobbyRankingMinOrderByAggregateInput = {
    id?: SortOrder
    lobbyId?: SortOrder
    whiteName?: SortOrder
    blackName?: SortOrder
    winner?: SortOrder
    reasonCode?: SortOrder
    reasonLabel?: SortOrder
    scoreWhite?: SortOrder
    scoreBlack?: SortOrder
    durationSec?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    recordedAt?: SortOrder
  }

  export type LobbyRankingSumOrderByAggregateInput = {
    scoreWhite?: SortOrder
    scoreBlack?: SortOrder
    durationSec?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ReplayBufferRowCreateNestedManyWithoutReplayInput = {
    create?: XOR<ReplayBufferRowCreateWithoutReplayInput, ReplayBufferRowUncheckedCreateWithoutReplayInput> | ReplayBufferRowCreateWithoutReplayInput[] | ReplayBufferRowUncheckedCreateWithoutReplayInput[]
    connectOrCreate?: ReplayBufferRowCreateOrConnectWithoutReplayInput | ReplayBufferRowCreateOrConnectWithoutReplayInput[]
    createMany?: ReplayBufferRowCreateManyReplayInputEnvelope
    connect?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
  }

  export type ReplayBufferRowUncheckedCreateNestedManyWithoutReplayInput = {
    create?: XOR<ReplayBufferRowCreateWithoutReplayInput, ReplayBufferRowUncheckedCreateWithoutReplayInput> | ReplayBufferRowCreateWithoutReplayInput[] | ReplayBufferRowUncheckedCreateWithoutReplayInput[]
    connectOrCreate?: ReplayBufferRowCreateOrConnectWithoutReplayInput | ReplayBufferRowCreateOrConnectWithoutReplayInput[]
    createMany?: ReplayBufferRowCreateManyReplayInputEnvelope
    connect?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type ReplayBufferRowUpdateManyWithoutReplayNestedInput = {
    create?: XOR<ReplayBufferRowCreateWithoutReplayInput, ReplayBufferRowUncheckedCreateWithoutReplayInput> | ReplayBufferRowCreateWithoutReplayInput[] | ReplayBufferRowUncheckedCreateWithoutReplayInput[]
    connectOrCreate?: ReplayBufferRowCreateOrConnectWithoutReplayInput | ReplayBufferRowCreateOrConnectWithoutReplayInput[]
    upsert?: ReplayBufferRowUpsertWithWhereUniqueWithoutReplayInput | ReplayBufferRowUpsertWithWhereUniqueWithoutReplayInput[]
    createMany?: ReplayBufferRowCreateManyReplayInputEnvelope
    set?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    disconnect?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    delete?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    connect?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    update?: ReplayBufferRowUpdateWithWhereUniqueWithoutReplayInput | ReplayBufferRowUpdateWithWhereUniqueWithoutReplayInput[]
    updateMany?: ReplayBufferRowUpdateManyWithWhereWithoutReplayInput | ReplayBufferRowUpdateManyWithWhereWithoutReplayInput[]
    deleteMany?: ReplayBufferRowScalarWhereInput | ReplayBufferRowScalarWhereInput[]
  }

  export type ReplayBufferRowUncheckedUpdateManyWithoutReplayNestedInput = {
    create?: XOR<ReplayBufferRowCreateWithoutReplayInput, ReplayBufferRowUncheckedCreateWithoutReplayInput> | ReplayBufferRowCreateWithoutReplayInput[] | ReplayBufferRowUncheckedCreateWithoutReplayInput[]
    connectOrCreate?: ReplayBufferRowCreateOrConnectWithoutReplayInput | ReplayBufferRowCreateOrConnectWithoutReplayInput[]
    upsert?: ReplayBufferRowUpsertWithWhereUniqueWithoutReplayInput | ReplayBufferRowUpsertWithWhereUniqueWithoutReplayInput[]
    createMany?: ReplayBufferRowCreateManyReplayInputEnvelope
    set?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    disconnect?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    delete?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    connect?: ReplayBufferRowWhereUniqueInput | ReplayBufferRowWhereUniqueInput[]
    update?: ReplayBufferRowUpdateWithWhereUniqueWithoutReplayInput | ReplayBufferRowUpdateWithWhereUniqueWithoutReplayInput[]
    updateMany?: ReplayBufferRowUpdateManyWithWhereWithoutReplayInput | ReplayBufferRowUpdateManyWithWhereWithoutReplayInput[]
    deleteMany?: ReplayBufferRowScalarWhereInput | ReplayBufferRowScalarWhereInput[]
  }

  export type GameReplayCreateNestedOneWithoutBufferRowsInput = {
    create?: XOR<GameReplayCreateWithoutBufferRowsInput, GameReplayUncheckedCreateWithoutBufferRowsInput>
    connectOrCreate?: GameReplayCreateOrConnectWithoutBufferRowsInput
    connect?: GameReplayWhereUniqueInput
  }

  export type GameReplayUpdateOneRequiredWithoutBufferRowsNestedInput = {
    create?: XOR<GameReplayCreateWithoutBufferRowsInput, GameReplayUncheckedCreateWithoutBufferRowsInput>
    connectOrCreate?: GameReplayCreateOrConnectWithoutBufferRowsInput
    upsert?: GameReplayUpsertWithoutBufferRowsInput
    connect?: GameReplayWhereUniqueInput
    update?: XOR<XOR<GameReplayUpdateToOneWithWhereWithoutBufferRowsInput, GameReplayUpdateWithoutBufferRowsInput>, GameReplayUncheckedUpdateWithoutBufferRowsInput>
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type ReplayBufferRowCreateWithoutReplayInput = {
    createdAt: string
    result: string
    ply: number
    fen: string
  }

  export type ReplayBufferRowUncheckedCreateWithoutReplayInput = {
    id?: number
    createdAt: string
    result: string
    ply: number
    fen: string
  }

  export type ReplayBufferRowCreateOrConnectWithoutReplayInput = {
    where: ReplayBufferRowWhereUniqueInput
    create: XOR<ReplayBufferRowCreateWithoutReplayInput, ReplayBufferRowUncheckedCreateWithoutReplayInput>
  }

  export type ReplayBufferRowCreateManyReplayInputEnvelope = {
    data: ReplayBufferRowCreateManyReplayInput | ReplayBufferRowCreateManyReplayInput[]
    skipDuplicates?: boolean
  }

  export type ReplayBufferRowUpsertWithWhereUniqueWithoutReplayInput = {
    where: ReplayBufferRowWhereUniqueInput
    update: XOR<ReplayBufferRowUpdateWithoutReplayInput, ReplayBufferRowUncheckedUpdateWithoutReplayInput>
    create: XOR<ReplayBufferRowCreateWithoutReplayInput, ReplayBufferRowUncheckedCreateWithoutReplayInput>
  }

  export type ReplayBufferRowUpdateWithWhereUniqueWithoutReplayInput = {
    where: ReplayBufferRowWhereUniqueInput
    data: XOR<ReplayBufferRowUpdateWithoutReplayInput, ReplayBufferRowUncheckedUpdateWithoutReplayInput>
  }

  export type ReplayBufferRowUpdateManyWithWhereWithoutReplayInput = {
    where: ReplayBufferRowScalarWhereInput
    data: XOR<ReplayBufferRowUpdateManyMutationInput, ReplayBufferRowUncheckedUpdateManyWithoutReplayInput>
  }

  export type ReplayBufferRowScalarWhereInput = {
    AND?: ReplayBufferRowScalarWhereInput | ReplayBufferRowScalarWhereInput[]
    OR?: ReplayBufferRowScalarWhereInput[]
    NOT?: ReplayBufferRowScalarWhereInput | ReplayBufferRowScalarWhereInput[]
    id?: IntFilter<"ReplayBufferRow"> | number
    replayId?: StringFilter<"ReplayBufferRow"> | string
    createdAt?: StringFilter<"ReplayBufferRow"> | string
    result?: StringFilter<"ReplayBufferRow"> | string
    ply?: IntFilter<"ReplayBufferRow"> | number
    fen?: StringFilter<"ReplayBufferRow"> | string
  }

  export type GameReplayCreateWithoutBufferRowsInput = {
    id: string
    createdAt: string
    result: string
    fen?: string | null
    pgn?: string | null
    movesJson: string
    metaJson: string
  }

  export type GameReplayUncheckedCreateWithoutBufferRowsInput = {
    id: string
    createdAt: string
    result: string
    fen?: string | null
    pgn?: string | null
    movesJson: string
    metaJson: string
  }

  export type GameReplayCreateOrConnectWithoutBufferRowsInput = {
    where: GameReplayWhereUniqueInput
    create: XOR<GameReplayCreateWithoutBufferRowsInput, GameReplayUncheckedCreateWithoutBufferRowsInput>
  }

  export type GameReplayUpsertWithoutBufferRowsInput = {
    update: XOR<GameReplayUpdateWithoutBufferRowsInput, GameReplayUncheckedUpdateWithoutBufferRowsInput>
    create: XOR<GameReplayCreateWithoutBufferRowsInput, GameReplayUncheckedCreateWithoutBufferRowsInput>
    where?: GameReplayWhereInput
  }

  export type GameReplayUpdateToOneWithWhereWithoutBufferRowsInput = {
    where?: GameReplayWhereInput
    data: XOR<GameReplayUpdateWithoutBufferRowsInput, GameReplayUncheckedUpdateWithoutBufferRowsInput>
  }

  export type GameReplayUpdateWithoutBufferRowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    fen?: NullableStringFieldUpdateOperationsInput | string | null
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    movesJson?: StringFieldUpdateOperationsInput | string
    metaJson?: StringFieldUpdateOperationsInput | string
  }

  export type GameReplayUncheckedUpdateWithoutBufferRowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    fen?: NullableStringFieldUpdateOperationsInput | string | null
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    movesJson?: StringFieldUpdateOperationsInput | string
    metaJson?: StringFieldUpdateOperationsInput | string
  }

  export type ReplayBufferRowCreateManyReplayInput = {
    id?: number
    createdAt: string
    result: string
    ply: number
    fen: string
  }

  export type ReplayBufferRowUpdateWithoutReplayInput = {
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    ply?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
  }

  export type ReplayBufferRowUncheckedUpdateWithoutReplayInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    ply?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
  }

  export type ReplayBufferRowUncheckedUpdateManyWithoutReplayInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    result?: StringFieldUpdateOperationsInput | string
    ply?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}