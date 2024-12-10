import { Route, Routes } from 'react-router-dom'
import React from 'react'
import Home from './Home.js'
import Autho from './Authorization.js'
import Reg from './Registration.js'
import Profile from './Profile.js'
import './bootstrap.min.css'
import Article from './Article.js'
import Category from './Category.js'
import Admin from './Admin.js'

function App(){
  return(
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/adminpage' element={<Admin />}/>
      <Route path='/authorization' element={<Autho />}/>
      <Route path='/registration' element={<Reg />}/>
      <Route path='/profile/:login' element={<Profile />}/>
      <Route path='/article/:id' element={<Article />}/>
      <Route path='/category/:id' element={<Category />}/>
    </Routes>
  )
}

export default App;
