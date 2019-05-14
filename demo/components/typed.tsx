import app, { Component } from '../../src/apprun';
import { Update, View } from '../../src/types'

type Model = number;
type Events = '#counter' | '(-1)' | '(+1)';

export default class MyComponent extends Component<Model, Events> {
  state = 0;

  view: View<Model> = (state) => {
    return <div>
      {state}
    </div>
  }

  // update: Update<Model, Events>  = {
  //   '#counter': s => s,
  //   '(-1)': state => state - 1,
  //   '(+1)': state => state + 1
  // }

  update: Update<Model, Events> = [
    ['#counter', state => state],
    ['(-1)', state => state - 1],
    ['(+1)', state => state + 1]
  ]

}