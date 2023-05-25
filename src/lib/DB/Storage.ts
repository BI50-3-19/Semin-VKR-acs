import {
    GridFSBucket,
    GridFSBucketReadStream,
    MongoClient
} from "mongodb";

import { DB } from ".";

class StorageAvatars {
    private readonly _db: Storage;
    private readonly _storage: GridFSBucket;

    private _getFilename(id: string): string {
        return `avatar_${id}.jpg`;
    }

    constructor(storage: Storage) {
        this._db = storage;
        this._storage = new GridFSBucket(this._db.client.db(this._db.database), {
            bucketName: "avatars",
        });
    }

    public async exists(id: string): Promise<boolean> {
        const files = await this._storage.find({
            filename: this._getFilename(id),
        }).toArray();

        return files.length > 0;
    }

    public async download(id: string): Promise<Buffer> {
        const downloadStream = this._storage.openDownloadStreamByName(
            this._getFilename(id)
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

    public getDownloadStream(id: string): GridFSBucketReadStream {
        return this._storage.openDownloadStreamByName(
            this._getFilename(id)
        );
    }

    public async upload(id: string, file: Buffer): Promise<string> {
        const uploadStream = this._storage.openUploadStream(this._getFilename(id));

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

