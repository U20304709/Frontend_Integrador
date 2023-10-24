import React from 'react'
import ICategory from '../types/category.type'
import Category from './Category'

const CategoryList = ({ categories, loading, deleteCategory, editCategory }: any) => {
  return (
    <>
      <div className="my-8 overflow-x-auto">
        <div className="flex shadow border-b">
          <table className="min-w-full table">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2">
                  ID
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-0">
                  NAME
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-0">
                  SUPPLIER
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-0"></th>
              </tr>
            </thead>
            {!loading && (
              <tbody className="bg-white">
                {categories?.map((category: ICategory) => (
                  <Category
                    category={category}
                    key={category.id}
                    deleteCategory={deleteCategory}
                    editCategory={editCategory}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </>
  )
}

export default CategoryList