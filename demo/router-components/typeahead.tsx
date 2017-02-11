import app from '../../index-jsx'

const model = {
  input: '',
  selectIdx: -1,
  options: []
}

const view = (model) => <div className='typeahead'>
  <input value={model.input} 
    oninput={e=>app.run('input', e)} 
    onkeyup={e=>app.run('keyup', e)}/>
  <ul className='options'>{
    model.options.map((option, idx)=><li
      className={(idx === model.selectIdx) ? 'selected': ''} 
      onclick={()=>app.run('select', option)}>{option}
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
  'select':(model, option) => selected(model, option)
}

const getOptions = text => text ?
  [1, 2, 3, 4, 5].map(n=>text + n) : []

app.on('selected', (text) => { console.log(text) });

export const Typeahead = ({model}) => view(model)
export const TypeaheadUpdate = update 

export default (element) => app.start(element, model, view, update);