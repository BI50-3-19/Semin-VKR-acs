import {
    GridFSBucket,
    GridFSBucketReadStream,
    MongoClient
} from "mongodb";

import { DB } from ".";

class StorageAvatars {
    private readonly _db: Storage;
    private readonly _storage: GridFSBucket;

    private _getFilename(userId: number): string {
        return `avatar_${userId}.jpg`;
    }

    constructor(storage: Storage) {
        this._db = storage;
        this._storage = new GridFSBucket(this._db.client.db(this._db.database), {
            bucketName: "avatars",
        });
    }

    public async exists(userId: number): Promise<boolean> {
        const files = await this._storage.find({
            filename: this._getFilename(userId),
        }).toArray();

        return files.length > 0;
    }

    public async download(userId: number): Promise<Buffer> {
        const downloadStream = this._storage.openDownloadStreamByName(
            this._getFilename(userId)
        );

        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];

            downloadStream.on("data", (chunk: Buffer) => {
                chunks.push(chunk);
            });

            downloadStream.once("finish", () => {
                resolve(Buffer.concat(chunks));
            });

            downloadStream.once("error", reject);
        });
    }

    public getDownloadStream(userId: number): GridFSBucketReadStream {
        return this._storage.openDownloadStreamByName(
            this._getFilename(userId)
        );
    }

    public async upload(userId: number, file: Buffer): Promise<string> {
        const uploadStream = this._storage.openUploadStream(this._getFilename(userId));

        return new Promise((resolve, reject) => {
            uploadStream.once("finish", resolve);
            uploadStream.once("error", reject);

            uploadStream.end(file);
        });
    }
}

class Storage {
    public readonly database: string;
    public readonly client: MongoClient;

    public readonly avatars: StorageAvatars;

    constructor(db: DB) {
        this.client = new MongoClient(
            `${db.config.db.protocol}://${db.config.db.login}:${db.config.db.password}@${db.config.db.address}/`
        );
        this.database = db.config.db.filesDatabase;
        this.avatars = new StorageAvatars(this);
    }
}

export default Storage;

