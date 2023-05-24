class Section {
    public readonly name: string;
    public readonly auth: "jwt" | "device-token" | "none";
    public readonly methods: string[];

    constructor({
        name,
        auth,
        methods
    }: {
        name: Section["name"];
        auth: Section["auth"];
        methods: Section["methods"];
    }) {
        this.name = name;
        this.auth = auth;
        this.methods = methods;
    }

    public async load(): Promise<void> {
        await Promise.all(this.methods.map((method) => {
            return new Promise((resolve) => {
                void import(`${__dirname}/methods/${this.name}/${method}`).then(resolve);
            });
        }));
    }
}

export default Section;
