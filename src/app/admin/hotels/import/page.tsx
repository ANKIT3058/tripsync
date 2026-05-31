'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Search, Download, MapPin, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Region {
  id: string
  name: string
  country: string
  type: string
}

interface ImportResult {
  imported: number
  skipped: number
  errors: number
  hotels: Array<{
    id: string
    name: string
    city: string
    externalId: string
  }>
}

export default function BulkImportPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [importLimit, setImportLimit] = useState(25)
  const [searchLoading, setSearchLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  const searchRegions = async () => {
    if (!searchQuery.trim()) return
    
    setSearchLoading(true)
    setError('')
    
    try {
      console.log(`Frontend: Searching for regions with query: "${searchQuery}"`)
      
      const response = await fetch(`/api/admin/hotels/import?query=${encodeURIComponent(searchQuery.trim())}`)
      
      console.log(`Frontend: API Response Status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Frontend: API Error Response:', errorData)
        throw new Error(errorData.error || `API returned ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Frontend: API Response Data:', data)
      
      setRegions(data.regions || [])
      
      if (!data.regions || data.regions.length === 0) {
        setError(`No regions found for "${searchQuery}". Try a different city name.`)
      }
    } catch (error) {
      console.error('Frontend: Error searching regions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to search regions'
      setError(`Search failed: ${errorMessage}. Please check console for details.`)
    } finally {
      setSearchLoading(false)
    }
  }

  const importHotels = async () => {
    if (!selectedRegion) return
    
    setImportLoading(true)
    setError('')
    setImportResult(null)
    
    try {
      const response = await fetch('/api/admin/hotels/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: selectedRegion.name,
          limit: importLimit
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Import failed')
      }
      
      const data = await response.json()
      setImportResult(data.results)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Import failed. Please try again.')
      console.error('Error importing hotels:', error)
    } finally {
      setImportLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchRegions()
    }
  }

  return (
    <AdminLayout title="Bulk Import Hotels">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Search Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Search size={20} />
            Search Cities & Regions
          </h2>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter city name (e.g., Paris, London, Tokyo)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                disabled={searchLoading}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>
            <button
              onClick={searchRegions}
              disabled={!searchQuery.trim() || searchLoading}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>
          
          {regions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Select Region:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedRegion?.id === region.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">{region.name}</span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {region.country} • {region.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Import Configuration */}
        {selectedRegion && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Download size={20} />
              Import Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Selected Region
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{selectedRegion.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{selectedRegion.country}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Number of Hotels to Import
                </label>
                <select
                  value={importLimit}
                  onChange={(e) => setImportLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                >
                  <option value={10}>10 hotels</option>
                  <option value={25}>25 hotels</option>
                  <option value={50}>50 hotels</option>
                  <option value={100}>100 hotels</option>
                </select>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-blue-800 dark:text-blue-200 font-medium">Import Notes</h4>
                    <ul className="mt-1 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• All imported hotels will be set to &quot;Pending Approval&quot; status</li>
                      <li>• Existing hotels (by External ID) will be skipped</li>
                      <li>• Hotels without sufficient data may be skipped</li>
                      <li>• You can review and approve hotels after import</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <button
                onClick={importHotels}
                disabled={importLoading}
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {importLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Importing Hotels...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Import Hotels
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300 font-medium">Error</span>
            </div>
            <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Import Results
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{importResult.imported}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Imported</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{importResult.skipped}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Skipped</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{importResult.errors}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Errors</div>
              </div>
            </div>
            
            {importResult.hotels.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">Imported Hotels:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.hotels.map((hotel) => (
                    <div key={hotel.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{hotel.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{hotel.city} • ID: {hotel.externalId}</div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
                        Pending Approval
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push('/admin/hotels')}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Review Hotels
              </button>
              <button
                onClick={() => {
                  setImportResult(null)
                  setSelectedRegion(null)
                  setRegions([])
                  setSearchQuery('')
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Import More Hotels
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}