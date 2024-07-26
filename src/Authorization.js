import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import axios from'axios'
import {Link, Navigate, useLocation} from 'react-router-dom'
import React, {useState} from 'react'
import {Button} from 'react-bootstrap'
import Header from './components/Header'
    

export default function Autho() {
    const [error, seterror] = useState('')
    const [valid, setvalid] = useState(false)
    const {state} = useLocation()

    const AuthoSchema = Yup.object().shape({
      login: Yup.string()
      .required('Обязательное поле'),
      password: Yup.string()
      .required('Обязательное поле')
    });

    const authorize = (user) => {
      var myParams = {data : user}
      axios.post('/api/autho/', myParams)
      .then((response) => {
        if (response.data === 0){
          seterror('Неверный логин или пароль')
        }
        else {
          localStorage.setItem("jwt_token", response.data)
          if (error !== ''){
            seterror('')
          }
          setvalid(true)
        }
      }).catch((error) => {
        console.log(error)
      })
    }
    return (
      <div>
        <Header authorized={false} login={''}/>
        <div>&nbsp;</div>
        <div className="container text-center">
          <div className="row">
            <div className="col-lg-12">
              {valid && (
                <Navigate to={state['curr_page']} replace={true} state={state['book']}/>
              )}
              <Formik initialValues={{ "login" : '', "password" : ''}} validationSchema={AuthoSchema} onSubmit={(values) => authorize(values)} >
              {({ handleSubmit, handleChange, handleBlur, values, touched, errors, }) => (
                <div>
                  <div className="row mb-5">
                      <div className="col-lg-12">
                          <h1 className="mt-5">Авторизация</h1>
                      </div>
                  </div>
                  <Form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="login">Логин</label>
                      <div></div>
                      <Field name='login' type='text' placeholder='Введите Логин' value={values.login} onChange={handleChange} onBlur={handleBlur}/>
                      {errors.login && touched.login ? (
                        <div style = {{color: 'red'}}>{errors.login}</div>
                      ) : (<div>&nbsp;</div>)}
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Пароль</label>
                      <div></div>
                      <Field name='password' type='password' placeholder='Введите пароль' value={values.password} onChange={handleChange} onBlur={handleBlur}/>
                      {errors.password && touched.password ? (
                        <div style = {{color: 'red'}}>{errors.password}</div>
                      ) : (<div>&nbsp;</div>)}
                    </div>
                    <div style = {{color: 'red'}}>{error}&nbsp;</div>
                    <Button type="submit">Авторизироваться</Button>
                  </Form>
                  <Link to='/registration' state={{'curr_page': state['curr_page'], 'book': state['book']}}>Регистрация</Link>
                </div>
              )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    );
  }