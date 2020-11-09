import { Column, Connection, createConnection, PrimaryColumn, Repository } from "typeorm";

export class Image {
    @PrimaryColumn()
    id: string;

    @Column()
    content: Buffer;

    @Column()
    name: string;
}

export class DataContext {
    #conn: Connection;
    #images: Repository<Image>;

    constructor(conn: Connection) {
        this.#conn = conn;

        this.#images = this.#conn.getRepository(Image);
    }

    get images(): Repository<Image> {
        return this.images;
    }
}

let conn: Connection;
export async function createDataContext() {
    if (conn == null) {
        conn = await createConnection({
            type: "sqlite",
            database: "data.db3",
            entities: [Image],
            synchronize: true
        });
    }

    let dataContext = new DataContext(conn);
    return dataContext;
}
