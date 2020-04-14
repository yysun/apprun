import app from 'apprun';

const state = {
  input: '',
  selectIdx: -1,
  options: []
}

const view = (state) => <>
  <style>{`
.typeahead input {
  width: 100%;
}
.typeahead .options li {
  padding: 4px;
}
.typeahead .options li:hover {
  background-color: #eeeeee;
}
.typeahead .options li.selected {
  background-color: #ffffaa;
}
  `}</style>
  <div class='typeahead'>
  <input $oninput={['input']} $onkeyup={['keyup']}/>
  <ul class='options'>{
    state.options.map((option, idx)=><li
      class={(idx === state.selectIdx) ? 'selected': ''}
      $onclick={['select', option]}>{option}
    </li>)
  }
  </ul>
  </div>
</>;

const select = (state, idx) => {
  if (idx<0) idx = 0;
  if (idx >= state.options.length) idx = state.options.length - 1;
  return ({...state,
    selectIdx: idx,
    input: state.options[idx]
  })
}

const selected = (state, option) => {
  app.run('selected', option);
  alert(option);
  return {...state, input: option, options: []};
}

const update = {
  input: async (state, e) => ({ ...state,
    input: e.target.value,
    selectIdx: -1,
    options: await getOptions(e.target.value)
  }),
  keyup: (state, e) => {
    switch(e.keyCode) {
      case 38:
        return select(state, state.selectIdx - 1);
      case 40:
        return select(state, state.selectIdx + 1);
      case 13:
        return selected(state, e.target.value);
      default:
        return state;
    }
  },
  select: (state, option) => selected(state, option)
}

const getOptions = async (text) => text ?
  [1, 2, 3, 4, 5].map(n=>text + n) : []

app.on('selected', (text) => { console.log(text) });

app.start(document.body, state, view, update);
