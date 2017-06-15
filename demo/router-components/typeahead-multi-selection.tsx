import app from '../../index'

const model = {
  input: '',
  selectIdx: -1,
  selected:[],
  options: []
}

const view = (model) => {
  return <div className='typeahead multi-selection'>
  <div>
    <ul className='selections'>{
      model.selected.map((s, idx)=><li>{s}
        <i className='icon-delete' onclick={()=>app.run('de-select',idx)}>x</i></li>)
    }
    </ul>
    <input value={model.input}
    oninput={e=>app.run('input', e)}
    onkeyup={e=>app.run('keyup', e)}/>
  </div>
  <ul className='options'>{
    model.options.map((option, idx)=><li
      className={(idx === model.selectIdx) ? 'selected': ''}
      onclick={()=>app.run('select', option)}>{option}
    </li>)
  }
  </ul>
</div>
}

const update = {
  '#multi-selection': (model) => model,
  'input': (model, e) => ({ ...model,
    input: e.target.value,
    selectIdx: -1,
    options: getOptions(e.target.value)
  }),
  'keyup': (model, e) => {
    switch(e.keyCode) {
      case 38:
        return select(model, model.selectIdx - 1);
      case 40:
        return select(model, model.selectIdx + 1);
      case 13:
        return selected(model, e.target.value);
      default:
        return model;
    }
  },
  'select':(model, option) => selected(model, option),
  'de-select': (model, idx) => ({...model,
    selected:[
     ...model.selected.slice(0, idx),
     ...model.selected.slice(idx + 1)
    ]
  })
}

const select = (model, idx) => {
  if (idx<0) idx = 0;
  if (idx >= model.options.length) idx = model.options.length - 1;
  return ({...model,
    selectIdx: idx,
    input: model.options[idx]
  })
}

const selected = (model, option) => ({...model,
  input: '',
  options: [],
  selected: [...model.selected, option]
})

const getOptions = text => text ?
  [1, 2, 3, 4, 5].map(n=>text + n) : []

export default (element) => app.start(element, model, view, update);