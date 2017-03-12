# jsonconv
Typescript json serialisation and de-serialisation object oriented library

## Motivation

Written for angular2 project - needed to quickly turn json into objects and
vice versa

## How to use

The best way to use it is to create a simple class with json fields and then
inherit from it

## Examples

Please take a look in the test specs for more examples

```typescript
class SimpleJson extends JsonConv {
    @json() public vBoolean: boolean;
    @json() public vString: string;
    @json() public vNumber: number;
}

const json1 = { vBoolean: true, vString: 'string', vNumber: 42 };
const json2 = { vBoolean: false, vString: 'other', vNumber: null };

const conv = SimpleJson.fromJson(json1);
const convArray = SimpleJson.arrayFromJson([json1, json2]);

console.log(conv.toJson(), convArray[1].toJson());
```

Supports different json key to be associated with the field

```typescript
class NickJson extends JsonConv {
    @json({ key: 'nick' }) public name: string;
}

const conv = NickJson.fromJson({ nick: 'nickname' });

console.log(conv.toJson());
```

Supports complex objects

```typescript
class ComplexJson extends JsonConv {
    @json() public date: Date;
    @json() public object: NickJson;
}

const json = { date: new Date().getTime(), object: { nick: 'nickname' } };

const conv = ComplexJson.fromJson(json);

console.log(conv.toJson());
```

Arrays require hints for their item type

```typescript
class ComplexArrayJson extends JsonConv {
    @json() public invalidDateArray: Date[];
    @json({ ItemClass: Date }) public validDateArray: Date[];
}

const json = {
    invalidDateArray: [ new Date().getTime(), new Date().getTime() ],
    validDateArray: [ new Date().getTime(), new Date().getTime() ]
};

const conv = ComplexArrayJson.fromJson(json);

console.log(conv.toJson());
```

You can omit fields from being serialised

```typescript
class OutJson extends JsonConv {
    @json() public inAndOut: string;
    @json({ out: false }) public inOnly: number;
}

const json = { inAndOut: 'hey', inOnly: 123 };

const conv = OutJson.fromJson(json);

console.log(conv.toJson());
```
