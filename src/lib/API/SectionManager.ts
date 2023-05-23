import Section from "./Section";

class SectionManager {
    public readonly sections: Section[] = [];

    public add(section: Section): void {
        this.sections.push(section);
    }

    public async load(): Promise<void> {
        await Promise.all(this.sections.map((section) => {
            return section.load();
        }));
    }

    public getSection(name: string): Section | undefined {
        return this.sections.find((section) => {
            return section.name === name;
        });
    }
}

const sectionManager = new SectionManager();

sectionManager.add(new Section({
    name: "status",
    auth: "none",
    methods: [
        "get"
    ]
}));

sectionManager.add(new Section({
    name: "session",
    auth: "none",
    methods: [
        "create"
    ]
}));

sectionManager.add(new Section({
    name: "users",
    auth: "jwt",
    methods: [
        "get"
    ]
}));

export default sectionManager;
