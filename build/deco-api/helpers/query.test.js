"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const query_1 = require("./query");
test('Constructor', () => {
    let query = new query_1.Query();
    expect(query.onlyQuery()).toEqual({});
    expect(query.onlyLimit()).toEqual(0);
    expect(query.onlySkip()).toEqual(0);
    expect(query.onlySort()).toEqual({});
    let query2 = new query_1.Query({ _id: 'salut' });
    expect(query2.onlyQuery()).toEqual({ _id: 'salut' });
});
test('Add Query', () => {
    let query = new query_1.Query();
    let response = query.addQuery({ _id: 'salut' });
    expect(response).toBeInstanceOf(query_1.Query);
    expect(query.onlyQuery()).toEqual({ _id: 'salut' });
    query.addQuery({ name: 'Ben' });
    expect(query.onlyQuery()).toEqual({ $and: [{ _id: 'salut' }, { name: 'Ben' }] });
});
test('Set order by', () => {
    let query = new query_1.Query();
    let response = query.orderBy('name', 'ASC');
    expect(response).toBeInstanceOf(query_1.Query);
    expect(query.onlySort()).toEqual({ name: 1 });
    query.orderBy('age', 'desc');
    expect(query.onlySort()).toEqual({ age: -1, name: 1 });
    query.orderBy('size');
    expect(query.onlySort()).toEqual({ age: -1, name: 1, size: 1 });
});
test('Set limit', () => {
    let query = new query_1.Query();
    let response = query.limit(20);
    expect(response).toBeInstanceOf(query_1.Query);
    expect(query.onlyLimit()).toEqual(20);
    query.limit('25');
    expect(query.onlyLimit()).toEqual(25);
    query.limit(null);
    expect(query.onlyLimit()).toEqual(0);
});
test('Set skip', () => {
    let query = new query_1.Query();
    let response = query.skip(20);
    expect(response).toBeInstanceOf(query_1.Query);
    expect(query.onlySkip()).toEqual(20);
    query.skip('25');
    expect(query.onlySkip()).toEqual(25);
    query.skip(null);
    expect(query.onlySkip()).toEqual(0);
});
test('Return methods', () => {
    let query = new query_1.Query({ _id: 'abcd' }).orderBy('name').limit(18).skip(2);
    expect(query.onlyQuery()).toEqual({ _id: 'abcd' });
    expect(query.onlySort()).toEqual({ name: 1 });
    expect(query.onlyLimit()).toEqual(18);
    expect(query.onlySkip()).toEqual(2);
    expect(query.complete()).toEqual({ $query: { _id: 'abcd' }, $sort: { name: 1 } });
    expect(query.print()).toEqual(JSON.stringify({ $query: { _id: 'abcd' }, $sort: { name: 1 } }));
});
//# sourceMappingURL=query.test.js.map