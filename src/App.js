import { Route, Routes } from 'react-router-dom'
import Home from './Home.js'
import Autho from './Authorization.js'
import Reg from './Registration.js'
import Profile from './Profile.js'
import './bootstrap.min.css'
import Article from './Article.js'
import Category from './Category.js'
import Publisher from './Publisher.js'

function App(){
  return(
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/authorization' element={<Autho />}/>
      <Route path='/registration' element={<Reg />}/>
      <Route path='/profile/:login' element={<Profile />}/>
      <Route path='/article/:id' element={<Article />}/>
      <Route path='/category/:id' element={<Category />}/>
      <Route path='/publisher/:id' element={<Publisher />}/>
    </Routes>
  )
}

export default App;
