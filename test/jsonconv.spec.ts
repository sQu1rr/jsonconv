import 'core-js/es7/reflect'; // polyfill for reflection

import {} from 'mocha';
import { should } from 'chai';
import { JsonConv, json } from '../src/jsonconv';

should();

class SimpleJson extends JsonConv {
    @json() public vBoolean: boolean;
    @json() public vString: string;
    @json() public vNumber: number;
}

describe('Simple Json Conversion', () => {
    const json1 = {
        vBoolean: true,
        vString: 'string',
        vNumber: 42
    };

    const json2 = {
        vBoolean: false,
        vString: 'other',
        vNumber: null
    };

    it('Should be able to initialise from json', () => {
        const conv = new SimpleJson();
        conv.fromJson(json1);

        conv.vBoolean.should.equal(json1.vBoolean);
        conv.vString.should.equal(json1.vString);
        conv.vNumber.should.equal(json1.vNumber);
    });

    it('Should be able to be created from json', () => {
        const conv = SimpleJson.fromJson(json1);

        conv.should.be.instanceof(SimpleJson);
        conv.vBoolean.should.equal(json1.vBoolean);
        conv.vString.should.equal(json1.vString);
        conv.vNumber.should.equal(json1.vNumber);
    });

    it('Should convert to identical json it was created from', () => {
        const conv = SimpleJson.fromJson(json1);

        const back = conv.toJson();
        back.should.deep.equal(json1);
    });

    it('Should support creation from array', () => {
        const convArray = SimpleJson.arrayFromJson([json1, json2]);

        convArray.should.be.instanceof(Array);

        convArray[0].vBoolean.should.equal(json1.vBoolean);
        convArray[0].vString.should.equal(json1.vString);
        convArray[0].vNumber.should.equal(json1.vNumber);

        convArray[1].vBoolean.should.equal(json2.vBoolean);
        convArray[1].vString.should.equal(json2.vString);
        convArray[1].should.have.property('vNumber', null);
    });

    it('Should update non null values', () => {
        const conv = SimpleJson.fromJson(json1);
        conv.updateJson(json2);

        conv.vBoolean.should.equal(json2.vBoolean);
        conv.vString.should.equal(json2.vString);
        conv.vNumber.should.equal(json1.vNumber);
    });
});

class NickJson extends JsonConv {
    @json({ key: 'nick' }) public name: string;
}

describe('Json Nickname Test', () => {
    const json = {
        nick: 'nickname'
    };

    const conv = NickJson.fromJson(json);

    it('Should be able to use different json name', () => {
        conv.name.should.equal(json.nick);
        conv.should.not.have.property('nick');
    });

    it('Should convert to identical json it was created from', () => {
        const back = conv.toJson();
        back.should.deep.equal(json);
    });
});

class ComplexJson extends JsonConv {
    @json() public date: Date;
    @json() public object: NickJson;
}

describe('Testing complex json types', () => {
    const json = {
        date: new Date().getTime(),
        object: { nick: 'nickname' }
    };

    const conv = ComplexJson.fromJson(json);

    it('Should be converted into valid objects with correct values', () => {
        conv.date.should.be.instanceof(Date);
        conv.object.should.be.instanceof(NickJson);

        conv.date.getTime().should.equal(json.date);
        conv.object.name.should.equal(json.object.nick);
    });

    it('Should convert to identical json it was created from', () => {
        const back = conv.toJson();
        back.should.deep.equal(json);
    });
});

describe('Testing complex json with null values', () => {
    const json = {
        date: null,
        object: null
    };

    const conv = ComplexJson.fromJson(json);

    it('Should be converted into valid objects with null values', () => {
        conv.should.have.property('date', null);
        conv.should.have.property('object', null);
    });

    it('Should convert to identical json it was created from', () => {
        const back = conv.toJson();
        back.should.deep.equal(json);
    });
});

class ArrayJson extends JsonConv {
    @json() public array: number[];
}

describe('Testing simple array conversions', () => {
    const json = {
        array: [ 1, 2, 3 ]
    };

    const conv = ArrayJson.fromJson(json);

    it('Should be converted into valid objects with correct values', () => {
        conv.array.should.be.instanceof(Array);
        conv.array.should.deep.equal(json.array);
    });

    it('Should convert to identical json it was created from', () => {
        const back = conv.toJson();
        back.should.deep.equal(json);
    });
});

class ComplexArrayJson extends JsonConv {
    @json() public invalidDateArray: Date[];
    @json({ ItemClass: Date }) public validDateArray: Date[];
}

describe('Testing complex-typed array conversions', () => {
    const json = {
        invalidDateArray: [ new Date().getTime(), new Date().getTime() ],
        validDateArray: [ new Date().getTime(), new Date().getTime() ]
    };

    const conv = ComplexArrayJson.fromJson(json);

    it('Should be converted into valid objects with correct values', () => {
        conv.invalidDateArray.should.be.instanceof(Array);
        conv.validDateArray.should.be.instanceof(Array);

        conv.invalidDateArray.should.deep.equal(json.invalidDateArray);

        conv.validDateArray[0].should.be.instanceof(Date);
        conv.validDateArray[1].should.be.instanceof(Date);
        conv.validDateArray[0].getTime().should.equal(json.validDateArray[0]);
        conv.validDateArray[1].getTime().should.equal(json.validDateArray[1]);
    });

    it('Should convert to identical json it was created from', () => {
        const back = conv.toJson();
        back.should.deep.equal(json);
    });
});

class OutJson extends JsonConv {
    @json() public inAndOut: string;
    @json({ out: false }) public inOnly: number;
}

describe('Testing input-only json types', () => {
    const json = {
        inAndOut: 'hey',
        inOnly: 123
    };

    const conv = OutJson.fromJson(json);

    it('Should be converted into valid objects with correct values', () => {
        conv.inAndOut.should.equal(json.inAndOut);
        conv.inOnly.should.equal(json.inOnly);
    });

    it('Should convert to json without in-only properties', () => {
        const back = conv.toJson();
        back.should.have.property('inAndOut');
        back.should.not.have.property('inOnly');
    });
});
