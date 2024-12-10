import React, {useState} from 'react'
import ReactModal from 'react-modal'
import { Button, CloseButton } from 'react-bootstrap'
import { Formik, Form, Field } from 'formik'
import axios from 'axios'
import ReactLoading from 'react-loading'
import { useNavigate } from 'react-router-dom'

function AuthorModal({auth_modal, setauthmodal, seterror, AuthorSchema, user, setuser}) {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const registrate_author = (author) => {
        setLoading(true)
        console.log(user)
        var myParams = {data : {'user_id' : user['id'], ...author}}
        axios.post('/api/reg/add_author', myParams)
        .then((response) => {
                if (response.data === '0') {
                    seterror('Автор с таким именем уже существует')
                }
                else {
                    setauthmodal(false)
                    setuser({...user, ...response.data})
                    navigate('/profile/' + user['login'])
                }
                console.log(response)
                setLoading(false)
            }
        ).catch((error) => {
            console.log(error)
            setLoading(false)
        })
    }

    return (
        <ReactModal isOpen={auth_modal} style={{content: {width: '25rem', height: '16rem', left: '37%', right: 'auto', top: '30%', bottom: 'auto'}}}>
            {loading ?
                <div className="App-loading">
                    <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={75} width={75}/>
                </div>
            :
                <Formik initialValues={{ "name" : '', "publisher" : ''}} validationSchema={AuthorSchema} onSubmit={(values) => {registrate_author(values)}} >
                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, }) => (
                    <div>
                        <div className='d-flex justify-content-end'>
                            <CloseButton onClick={() => { seterror(''); setauthmodal(false)} } />
                        </div>
                        <div className="row mb-1">
                            <h4 className="mt-1">Укажите имя, под которым будут публиковаться статьи</h4>
                        </div>
                        <Form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Имя</label>
                                <div></div>
                                <Field className="col-10" 
                                    name='name' 
                                    type='text' 
                                    placeholder='Введите имя' 
                                    value={values.name} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur}/>
                                {errors.name && touched.name ? (
                                    <div style = {{color: 'red'}}>{errors.name}</div>
                                ) : (<div>&nbsp;</div>)}
                            </div>
                            <div className='d-flex justify-content-end'>
                                <Button type="submit">Стать автором</Button>
                            </div>
                        </Form>
                    </div>
                )}
                </Formik>
            }
        </ReactModal>
    );
}

export default AuthorModal;

