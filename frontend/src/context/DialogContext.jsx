import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'alert', // 'alert', 'prompt', 'confirm'
    title: '',
    message: '',
    defaultValue: '',
    resolve: null
  });
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (dialogState.isOpen && dialogState.type === 'prompt' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dialogState.isOpen, dialogState.type]);

  const showAlert = (message, title = 'Notification') => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolve
      });
    });
  };

  const showPrompt = (message, title = 'Input Required', defaultValue = '') => {
    return new Promise((resolve) => {
      setInputValue(defaultValue);
      setDialogState({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        defaultValue,
        resolve
      });
    });
  };

  const showConfirm = (message, title = 'Confirm Action') => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve
      });
    });
  };

  const closeDialog = (result = null) => {
    if (dialogState.resolve) dialogState.resolve(result);
    setDialogState({ ...dialogState, isOpen: false });
    setInputValue('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dialogState.type === 'prompt') {
      closeDialog(inputValue);
    } else if (dialogState.type === 'confirm') {
      closeDialog(true);
    } else {
      closeDialog();
    }
  };

  return (
    <DialogContext.Provider value={{ showAlert, showPrompt, showConfirm }}>
      {children}
      
      {dialogState.isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => closeDialog(dialogState.type === 'confirm' ? false : null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {dialogState.type === 'alert' ? <Info className="text-blue-500" /> : 
                   dialogState.type === 'confirm' ? <AlertCircle className="text-orange-500" /> :
                   <CheckCircle className="text-primary-500" />}
                  {dialogState.title}
                </h3>
                <button 
                  onClick={() => closeDialog(dialogState.type === 'confirm' ? false : null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">{dialogState.message}</p>
              
              <form onSubmit={handleSubmit}>
                {dialogState.type === 'prompt' && (
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-6 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                  />
                )}
                
                <div className="flex justify-end gap-3">
                  {(dialogState.type === 'prompt' || dialogState.type === 'confirm') && (
                    <button
                      type="button"
                      onClick={() => closeDialog(dialogState.type === 'confirm' ? false : null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium shadow-sm"
                  >
                    {dialogState.type === 'alert' ? 'OK' : 
                     dialogState.type === 'prompt' ? 'Submit' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
