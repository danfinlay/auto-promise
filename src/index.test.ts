import auto from './index';

describe('Test', () => {
  it('handles the order of promises', async () => {
    const result = await auto({
      name: [async () => 'Bob'],
      greet: ['name', async (needs) => `Hi, ${needs.name}`],
    });
    expect(result.greet).toEqual('Hi, Bob');
    return true;
  });

  it('handles a more complex graph', async () => {
    const result = await auto({
      a: [async () => 'a'],
      b: [async () => 'b'],
      c: ['a', async (needs) => needs.a ? 'c' : 'no'],
      d: ['a', 'b', async (needs) => needs.a && needs.b ? 'd' : 'no'],
      e: ['c', 'd', async (needs) => needs.c && needs.d ? 'e' : 'no'],
    });
    expect(result.e).toEqual('e');
    return true;
  });

  it('handles a delayed more complex graph', async () => {
    const result = await auto({
      a: [async () => wait(50).then(() => 'a')],
      b: [async () => wait(20).then(() => 'b')],
      c: ['a', async (needs) => needs.a ? 'c' : 'no'],
      d: ['a', 'b', async (needs) => needs.a && needs.b ? 'd' : 'no'],
      e: ['c', 'd', 'f', async (needs) => needs.c && needs.d ? 'e' : 'no'],
      f: ['d', () => wait(100)],
    });
    expect(result.e).toEqual('e');
    return true;
  });
});

function wait (ms: number): Promise<void>{
  return new Promise((res) => { setTimeout(res, ms) });
}