import React, { ReactNode, useRef, useEffect } from 'react'
import { IoMdClose } from 'react-icons/io'

const ModalNew = ({ setModalNew, handleResetForm }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalNew(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [setModalNew])

  return (
    <div className='fixed z-[100] inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center py-2 overflow-y-auto'>
      <div
        className='mx-auto rounded-xl'
        ref={modalRef}
      >
        <div className='absolute top-2 right-2'>
          <IoMdClose
            size={40}
            className='cursor-pointer text-white'
            onClick={() => {
              setModalNew(false)
            }}
          />
        </div>
        <div className='p-1'>
          <div className='bg-white p-10 flex flex-col gap-5 rounded-md'>
            <div className='flex justify-center font-sans font-bold text-2xl text-[#00717A]'>
              Enter New Patient Data
            </div>
            <div className='px-6 font-sans '>
              Are you sure you want to enter new patient data?
              <br /> Any inputs will be discarded unless you save them.
            </div>
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setModalNew(false)}
                className=' text-black bg-transparent border-2 border-[#00717A] py-1 px-4 rounded-md'
              >
                Cancel
              </button>
              <button
                className=' text-white bg-[#00717A] py-1 px-5 rounded-md'
                onClick={() => {
                  handleResetForm()
                  setModalNew(false)
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalNew
