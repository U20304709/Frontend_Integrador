import React from 'react'
import Category from './Category'
import Modal from '../components/Modal'
import ShowModalBtn from '../components/ShowModalBtn'

const Page = () => {
  return (
    <>
      <Category />
      <Modal />
      <ShowModalBtn text="Create Category" />
    </>
  )
}

export default Page