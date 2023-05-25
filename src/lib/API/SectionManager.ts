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

sectionManager.add(new Section({
    name: "roles",
    auth: "jwt",
    methods: [
        "create",
        "edit",
        "delete"
    ]
}));

sectionManager.add(new Section({
    name: "groups",
    auth: "jwt",
    methods: [
        "create",
        "edit",
        "delete"
    ]
}));

sectionManager.add(new Section({
    name: "schedules",
    auth: "jwt",
    methods: [
        "create",
        "edit",
        "delete"
    ]
}));

sectionManager.add(new Section({
    name: "areas",
    auth: "jwt",
    methods: [
        "create",
        "edit",
        "delete"
    ]
}));

sectionManager.add(new Section({
    name: "devices",
    auth: "jwt",
    methods: [
        "create",
        "edit",
        "delete"
    ]
}));

sectionManager.add(new Section({
    name: "acs",
    auth: "device-token",
    methods: [
        "pass"
    ]
}));

sectionManager.add(new Section({
    name: "security",
    auth: "jwt",
    methods: [
        "getTempKey",
        "isValidTempKey"
    ]
}));

export default sectionManager;
