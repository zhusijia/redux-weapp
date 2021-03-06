import connect from '../es6/connect'
import {store, bindActionCreators, changeAppName} from './helper'

const connectApp = (onStateChange) => {
  return connect.App(
    store,
    (state, options) => ({name: state.app.name, ...options}),
    (dispatch) => ({changeName: bindActionCreators(changeAppName, dispatch)})
  )({onStateChange})
}

describe('connect ', () => {
  it('store with App', () => {
    const onStateChange = jest.fn()
    const app = connectApp(onStateChange)
    // life-cycle functions
    expect(app.onLaunch).toBeInstanceOf(Function)
    expect(app.onShow).toBeInstanceOf(Function)
    expect(app.onHide).toBeInstanceOf(Function)
    expect(app.onStateChange).toBeInstanceOf(Function)
    expect(app.changeName).toBeInstanceOf(Function)

    expect(store.getState().app.name).toBe('app')

    // listener is not setup
    // Though store has changed, no callback got called yet
    app.changeName('new app')
    expect(store.getState().app.name).toBe('new app')
    expect(onStateChange).not.toHaveBeenCalled()

    app.onLaunch({key: 'value'})
    expect(onStateChange).toHaveBeenLastCalledWith({name: 'new app', key: 'value'}, {}) //calls: 1

    app.changeName('new app2')
    expect(store.getState().app.name).toBe('new app2')
    expect(onStateChange).toHaveBeenLastCalledWith({name: 'new app2', key: 'value'}, {name: 'new app', key: 'value'})//calls: 2

    app.onHide() // will pause to notify states change
    app.changeName('new app3')
    expect(store.getState().app.name).toBe('new app3')
    expect(onStateChange).toHaveBeenCalledTimes(2)
    expect(onStateChange).toHaveBeenLastCalledWith({name: 'new app2', key: 'value'}, {name: 'new app', key: 'value'})

    app.onShow()
    expect(onStateChange).toHaveBeenLastCalledWith({name: 'new app3', key: 'value'}, {name: 'new app2', key: 'value'}) // resumed from inactive

    app.changeName('new app4')
    expect(store.getState().app.name).toBe('new app4')
    expect(onStateChange).toHaveBeenCalledTimes(4)
    expect(onStateChange).toHaveBeenLastCalledWith({name: 'new app4', key: 'value'}, {name: 'new app3', key: 'value'})

    app.changeName('new app4') //state not change
    expect(onStateChange).toHaveBeenCalledTimes(4)
  })

  it('store with App without mapState function', () => {
    const app = connect.App(
      store,
      null,
      (dispatch) => ({changeName: bindActionCreators(changeAppName, dispatch)})
    )({})

    expect(app.onLaunch).toBe(undefined)
    expect(app.onShow).toBe(undefined)
    expect(app.onHide).toBe(undefined)
    expect(app.onStateChange).toBe(undefined)
    expect(app.changeName).toBeInstanceOf(Function)

    expect(() => app.changeName('name')).not.toThrow()
  })

})
