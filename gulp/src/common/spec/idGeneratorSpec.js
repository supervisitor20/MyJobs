import IdGenerator from '../idGenerator';

describe('IdGenerator', () => {
  it('generates a series of numbers', () => {
    const gen = new IdGenerator();
    expect(gen.nextId()).toBe(1);
    expect(gen.nextId()).toBe(2);
    expect(gen.nextId()).toBe(3);
  });

  it('instances are idependent', () => {
    const gen1 = new IdGenerator();
    const gen2 = new IdGenerator();
    expect(gen1.nextId()).toBe(1);
    expect(gen2.nextId()).toBe(1);
    expect(gen1.nextId()).toBe(2);
    expect(gen2.nextId()).toBe(2);
  });
});

