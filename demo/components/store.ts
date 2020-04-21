function _random(max) {
  return Math.round(Math.random()*1000)%max;
}

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

let id = 1
function buildData(count) {
  return new Array(count).fill(0).map(_ => ({
    id: id++,
    label: `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`
  }))
}

export default {
  run: () => ({
    data: buildData(1000),
    selected: null
  }),

  add: state => ({
    data: state.data.concat(buildData(1000)),
    selected: state.selected,
  }),

  runLots: () => ({
    data: buildData(10000),
    selected: null
  }),

  clear: () => ({
    data: [],
    selected: null
  }),

  update: state => ({
    data: state.data.map((d, i) => {
      if (i % 10 === 0) {
        d.label = `${d.label} !!!`
      }
      return d
    }),
    selected: state.selected
  }),

  swapRows: state => {
    if (state.data.length > 4) {
      const idx = state.data.length - 2;
      const a = state.data[1];
      state.data[1] = state.data[idx];
      state.data[idx] = a;
    }
    return state;
  },

  select: (state, id) => ({
    data: state.data,
    selected: id
  }),

  delete: (state, id) => ({
    selected: id === state.selected ? null : state.selected,
    data: state.data.filter(d => d.id != id)
  })
}

