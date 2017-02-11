import app from '../../index-jsx'

const model = {
  $id: '_1',
  input: '',
  selectIdx: -1,
  options: []
}

const view = (model) => <div className='typeahead'>
  <input value={model.input} 
    oninput={e=>app.run(`input${model.$id}`, e)} 
    onkeyup={e=>app.run(`keyup${model.$id}`, e)}/>
  <ul className='options'>{
    model.options.map((option, idx)=><li
      className={(idx === model.selectIdx) ? 'selected': ''} 
      onclick={()=>app.run(`select${model.$id}`, option)}>{option}
    </li>)
  }
  </ul>
</div>;

const select = (model, idx) => {
  if (idx<0) idx = 0;
  if (idx >= model.options.length) idx = model.options.length - 1;
  return ({...model,
    selectIdx: idx,
    input: model.options[idx]
  })
}

const selected = (model, option) => {
  app.run('selected', option);
  return {...model, input: option, options: []};
}

const update = {
  '#typeahead': (model) => model,
  [`input${model.$id}`]: (model, e) => ({ ...model, 
    input: e.target.value,
    selectIdx: -1,
    options: getOptions(e.target.value)
  }),
  [`keyup${model.$id}`]: (model, e) => {
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
  [`select${model.$id}`]:(model, option) => selected(model, option)
}

const getOptions = text => text ?
  [1, 2, 3, 4, 5].map(n=>text + n) : []

app.on('selected', (text) => { console.log(text) });

export default (element) => app.start(element, model, view, update);