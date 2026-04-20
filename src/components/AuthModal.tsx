import React from 'react'

type PropsType= {
    open:boolean;
    onClose: ()=>void;
}

const AuthModal = ({open, onClose}:PropsType) => {
  return (
    <div>AuthModal</div>
  )
}

export default AuthModal