// empty import to calm compiler down
import {} from 'reflect-metadata';

class Property {
    constructor(public name: string, public Class: any,
                public jsonName: string, public ItemClass: any,
                public out: boolean) {
        if (!this.jsonName) this.jsonName = name;
    }
}

export function json(opts?: { key?: string, ItemClass?: any, out?: boolean }) {
    const params = Object.assign({ out: true }, opts);
    return <T extends JsonConv>(target: T, key: string) => {
        const Class: any = Reflect.getMetadata('design:type', target, key);
        const source: any = target.constructor;

        const property = new Property(
            key, Class, params.key, params.ItemClass, params.out
        );

        if (!source.properties) source.properties = new Array<Property>();
        source.properties.push(property);
    };
}

export class JsonConv {
    public static properties: Property[];

    public static fromJson<T extends JsonConv>(this: {new (): T},
                                               json?: any): T {
        if (!json) return null;

        const object = <T> (new this());
        object.fromJson(json);
        return object;
    }

    public static arrayFromJson<T extends JsonConv>(this: {new (): T},
                                                    json?: any[]): T[] {
        if (!json) return [];

        return json.map((item: any) => {
            const object = <T> (new this());
            object.fromJson(item);
            return object;
        });
    }

    public fromJson(json: Object): void  {
        this.properties.forEach((prop: Property) => {
            this[prop.name] = this.extract(prop, json);
        });
    }

    public updateJson(json: Object): void  {
        this.properties.forEach((prop: Property) => {
            const update = this.extract(prop, json);
            if (update !== null) this[prop.name] = update;
        });
    }

    public toJson(): any {
        const json: Object = {};
        this.properties.filter((prop) => {
            return prop.out;
        }).map((prop: Property) => {
            json[prop.jsonName] = this.serialise(prop);
        });
        return json;
    }

    private get properties(): Property[] {
        const source: any = this.constructor;
        const properties: Property[] = source.properties;
        return properties || [];
    }

    private extract(prop: Property, json: Object): any {
        let value: any = null;
        if (json && json.hasOwnProperty(prop.jsonName)) {
            value = json[prop.jsonName];
        }
        const instance: any = new prop.Class();

        // array detected
        if (instance instanceof Array) {
            if (!value) return [];

            // if type is not complex - skip to the end to return value
            if (prop.ItemClass) {
                const object = new prop.ItemClass();
                return value.map((item) => {
                    return this.extractProperty(prop.ItemClass, object, item);
                });
            }

            return value;
        }

        // just return whatever we have
        return this.extractProperty(prop.Class, instance, value);
    }

    private extractProperty(Class: any, instance: any, value: any): any {
        if (value === null || value === undefined) return null;

        // if json conv recursively convert
        if (instance instanceof JsonConv) {
            instance = new Class();
            instance.fromJson(value);
            return instance;
        }

        // date is a special snowflake
        if (instance instanceof Date) {
            return new Date(value);
        }

        // just return whatever we have
        return value;
    }

    private serialise(prop: Property): any {
        const value: any = this[prop.name];
        const instance: any = new prop.Class();

        // array detected
        if (instance instanceof Array) {
            if (!value) return [];

            // if type is not complex - skip to the end to return value
            if (prop.ItemClass) {
                const itemInstance = new prop.ItemClass();
                return value.map((item) => {
                    return this.serialiseProperty(itemInstance, item);
                });
            }

            return value;
        }

        return this.serialiseProperty(instance, value);
    }

    private serialiseProperty(instance: any, value: any): any {
        if (value === null || value === undefined) return null;

        // if json conv recursively serialise
        if (instance instanceof JsonConv) {
            return value.toJson();
        }

        // date is a special snowflake
        if (instance instanceof Date) {
            return value.getTime();
        }

        // just return what we have, it is probably an object or basic type
        return value;
    }
}
