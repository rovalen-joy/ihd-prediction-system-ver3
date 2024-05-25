import React, { ReactNode, useRef, useEffect, useState } from 'react'
import { IoMdClose } from 'react-icons/io'

const ModalSave = ({ setModalSave, handleSaveData }) => {
  const modalRef = useRef(null)
  const [disableSaveButton, setDisableSaveButton] = useState(false)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalSave(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [setModalSave])

  const handleConfirmButton = async () => {
    setDisableSaveButton(true)
    await handleSaveData()
    setModalSave(false)
  }

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
              setModalSave(false)
            }}
          />
        </div>
        <div className='p-1'>
          <div className='bg-white p-10 flex flex-col gap-5 rounded-md'>
            <div className='flex justify-center font-sans font-bold text-2xl text-[#00717A]'>
              Save Patient Data
            </div>
            <div className='px-6 font-sans '>
              Are you sure you want to save the patient's data?
            </div>
            <div className='flex justify-end gap-2'>
              <button className=' text-black bg-transparent border-2 border-[#00717A] py-1 px-4 rounded-md'>
                Cancel
              </button>
              <button
                className=' text-white bg-[#00717A] py-1 px-5 rounded-md'
                onClick={handleConfirmButton}
                disabled={disableSaveButton}
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

export default ModalSave
