import React, {Component} from 'react'

export default function createContext(data) {
    const Context = React.createContext();
  
    const provider = ({ children }) => {
      return <Context.Provider value={data}>{children}</Context.Provider>
    }
    
    const consumerContext = () => {
      const store = React.useContext(Context)
      if (!store) {
        // this is especially useful in TypeScript so you don't need to be checking for null all the time
        throw new Error('Context must be used within a Provider.')
      }
      return store
    }
    return {
        Provider: provider,
        getContext: consumerContext
    }
}