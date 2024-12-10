import React, { useState, useEffect } from 'react'
import ReactModal from 'react-modal'
import { Button, CloseButton } from 'react-bootstrap'
import { Formik, Form, Field } from 'formik'
import { Editor } from "react-draft-wysiwyg"
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import ReactLoading from 'react-loading'
import axios from 'axios'

const FormEditor = ({setFieldValue, value, name, placeholder, onBlur}) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())

  const prepareDraft = value => {
    const draft = htmlToDraft(value)
    const contentState = ContentState.createFromBlockArray(draft.contentBlocks)
    const editorState = EditorState.createWithContent(contentState)
    setEditorState(editorState)
  }

  useEffect(() => {
    prepareDraft(value);
  }, [])

  const onEditorStateChange = editorState => {
    const forFormik = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    )
    setFieldValue("text", forFormik)
    setEditorState(editorState)
  }

  return (
    <div className='bg-dark p-2'>
      <Editor
        editorState={editorState}
        toolbarStyle={{backgroundColor: 'black'}}
        wrapperStyle={{backgroundColor: 'white'}}
        editorStyle={{padding: '1rem', minHeight: '15rem'}}
        onEditorStateChange={onEditorStateChange}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
      />
    </div>
  )
}

export default function ArticleModal({add_modal, setaddmodal, formValues, setformValues, seterror, ArticleSchema, error, user}) {
    const [loading, setLoading] = useState(false)

    const add_article = (article) => {
        setLoading(true)
        setformValues(article)
        var myParams = {data : {...article, "author_id": user['id']}}
        axios.post('/api/main/add_article', myParams)
        .then((response) => {
                if (response.data === 1){
                    setaddmodal(false)
                    setformValues({'title': '', 'text': '<p></p>', 'category': '', 'categories': []})
                    if (error !== ''){
                        seterror('')
                    }
                }
                else if (response.data === 0){
                    seterror('Хотя бы одна категория должна быть указана')
                } 
                else {
                    seterror('Статья не смогла пройти проверку на плагиат. Результат - ' + response.data + '% - больше 90%')
                }
                setLoading(false)
                console.log(response.data)
            }
        ).catch((error) => {
            console.log(error)
            setLoading(false)
        })
    }

    return (
        <ReactModal isOpen={add_modal} ariaHideApp={false}>
            {loading ?
                <div className="App-loading">
                    <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
                </div>
            :
                <div>
                    <Formik initialValues={{ "title" : formValues['title'], "text": formValues['text'], "category" : formValues['category'], "categories": formValues['categories']}} 
                        validationSchema={ArticleSchema} onSubmit={(values) => {add_article(values)}} >
                    {({ handleSubmit, handleChange, handleBlur, setFieldValue, values, touched, errors, }) => (
                        <div>
                            <div className='d-flex justify-content-end'>
                                <CloseButton onClick={() => { seterror(''); setformValues(values); setaddmodal(false)} } />
                            </div>
                            <div>&nbsp;</div>
                            <Form onSubmit={handleSubmit}>
                                <div className='container'>
                                    <div className='row'>
                                        <div className='col'>
                                            <div className="form-group">
                                                <label htmlFor="title">Название статьи</label>
                                                <div></div>
                                                <Field className="col-12" 
                                                    name='title' 
                                                    type='text' 
                                                    placeholder='Введите название статьи' 
                                                    value={values.title} 
                                                    onChange={handleChange} 
                                                    onBlur={handleBlur}/>
                                                {errors.title && touched.title ? (
                                                    <div style = {{color: 'red'}}>{errors.title}</div>
                                                ) : (<div>&nbsp;</div>)}
                                            </div>
                                        </div>
                                        <div className='col d-flex align-items-center justify-content-end'>
                                            <div className='text-end'>
                                                <Button type="submit">Создать статью</Button>
                                                <div style = {{color: 'red'}}>{error}&nbsp;</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="categories">Категории</label>
                                        <div></div>
                                        <Field className='mb-2 col-4' 
                                            name='category' 
                                            type='text' 
                                            placeholder='Введите категорию' 
                                            value={values.category} 
                                            onChange={handleChange} 
                                            onBlur={handleBlur}/>
                                        <div></div>
                                        <Button className='my-1' onClick={() => {
                                            if (values.category !== '') {
                                                setFieldValue("categories", [...new Set([...values.categories, values.category])]) 
                                                setFieldValue("category", '')
                                            }
                                            }}>Добавить</Button>
                                        {values.categories.map((category) => 
                                            <Button variant="dark" className='mx-1 my-1' 
                                                onClick={() => {setFieldValue("categories", values.categories.filter((value) => value !== category))}}>
                                                    {category}
                                            </Button>)}
                                        {errors.category && touched.category ? (
                                            <div style = {{color: 'red'}}>{errors.category}</div>
                                        ) : (<div>&nbsp;</div>)}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="text">Текст статьи</label>
                                        <div></div>
                                        <Field className="col-10"
                                            value={values.text} 
                                            setFieldValue={setFieldValue} 
                                            component={FormEditor}
                                            name='text' 
                                            placeholder='Введите текст статьи' 
                                            onBlur={handleBlur}
                                            onChange={handleChange}/>
                                        {errors.text && touched.text ? (
                                            <div style = {{color: 'red'}}>{errors.text}</div>
                                        ) : (<div>&nbsp;</div>)}
                                    </div>
                                </div>
                            </Form>
                        </div>
                    )}
                    </Formik>
                </div>
            }
        </ReactModal>
    )
}