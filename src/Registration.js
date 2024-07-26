import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import axios from'axios'
import {Link, Navigate, useLocation} from 'react-router-dom'
import React, {useState} from 'react'
import {Button} from 'react-bootstrap'
import Header from './components/Header'

export default function Reg() {
    const [error, seterror] = useState('')
    const [valid, setvalid] = useState(false)
    const {state} = useLocation()

    const RegSchema = Yup.object().shape({
      login: Yup.string()
      .min(3, 'Слишком короткий логин')
      .max(20, 'Слишком длинный логин')
      .required('Обязательное поле'),
      password: Yup.string()
      .min(3, 'Слишком короткий пароль')
      .max(20, 'Слишком длинный пароль')
      .required('Обязательное поле'),
      retyped_password: Yup.string()
      .required('Обязательное поле')
      .oneOf([Yup.ref("password"), null], 'Пароли не совпадают')
    });

    const registrate = (user) => {
      delete user["retyped_password"]
      var myParams = {data : user}
      axios.post('/api/reg/', myParams)
      .then((response) => {
        if (response.data === 0){
          seterror('Такой пользователь уже зарегистрирован')
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
        <div className="container text-center">
          <div className="row">
            <div className="col-lg-12">
              {valid && (
                <Navigate to={state['curr_page']} replace={true} state={state['book']}/>
              )}
              <Formik initialValues={{ "login" : '', "password" : '', "retyped_password" : ''}} 
                validationSchema={RegSchema} 
                onSubmit={(values) => {registrate(values)}} >
              {({ handleSubmit, handleChange, handleBlur, values, touched, errors, }) => (
                <div>
                  <div className="row mb-1">
                      <div className="col-lg-12">
                          <h1 className="mt-5">Регистрация</h1>
                      </div>
                  </div>
                  <Form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="login">Логин</label>
                      <div></div>
                      <Field className="col-2" 
                        name='login' 
                        type='text' 
                        placeholder='Введите логин' 
                        value={values.login} 
                        onChange={handleChange} 
                        onBlur={handleBlur}/>
                      {errors.login && touched.login ? (
                        <div style = {{color: 'red'}}>{errors.login}</div>
                      ) : (<div>&nbsp;</div>)}
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Пароль</label>
                      <div></div>
                      <Field className="col-2" 
                        name='password' 
                        type='password' 
                        placeholder='Введите пароль' 
                        value={values.password} 
                        onChange={handleChange} 
                        onBlur={handleBlur}/>
                      {errors.password && touched.password ? (
                        <div style = {{color: 'red'}}>{errors.password}</div>
                      ) : (<div>&nbsp;</div>)}
                    </div>
                    <div className="form-group">
                      <label htmlFor="retyped_password">Подтверждение пароля</label>
                      <div></div>
                      <Field className="col-2" 
                        name='retyped_password' 
                        type='password' 
                        placeholder='Повторно введите пароль ' 
                        value={values.retyped_password} 
                        onChange={handleChange} 
                        onBlur={handleBlur}/>
                      {errors.retyped_password && touched.retyped_password ? (
                        <div style = {{color: 'red'}}>{errors.retyped_password}</div>
                      ) : (<div>&nbsp;</div>)}
                    </div>
                    <div style = {{color: 'red'}}>{error}&nbsp;</div>
                    <Button type="submit">Зарегистрироваться</Button>
                  </Form>
                  <Link to='/authorization' state={{'curr_page': state['curr_page'], 'book': state['book']}}>Авторизация</Link>
                </div>
              )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    );
}