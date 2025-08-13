// --- START OF FILE: src/app/dashboard/AutocompleteSelect.js ---

'use client'

import { useState } from 'react'
import { Combobox } from '@headlessui/react'

// Icono de Check para el item seleccionado
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Icono de flecha para el botón del combobox
const SelectorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
  </svg>
);

export default function AutocompleteSelect({ items, selected, setSelected, placeholder = "Seleccionar..." }) {
  const [query, setQuery] = useState('')

  // Filtramos los items basándonos en lo que el usuario escribe
  const filteredItems =
    query === ''
      ? items
      : items.filter((item) => {
          return item.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative">
        {/* El input donde el usuario escribe */}
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => setQuery('')} // Limpia la query cuando se pierde el foco para mostrar la lista completa la próxima vez
          displayValue={(item) => item} // Cómo se muestra el valor seleccionado en el input
          placeholder={placeholder}
        />
        {/* El botón que abre/cierra la lista de opciones */}
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon />
        </Combobox.Button>

        {/* La lista de opciones que aparece */}
        {filteredItems.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredItems.map((item) => (
              <Combobox.Option
                key={item}
                value={item}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  }`
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={`block truncate ${selected && 'font-semibold'}`}>
                      {item}
                    </span>
                    {selected && (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                          active ? 'text-white' : 'text-indigo-600'
                        }`}
                      >
                        <CheckIcon />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}