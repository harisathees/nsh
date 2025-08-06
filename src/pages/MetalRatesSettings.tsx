import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'

export function MetalRatesSettings() {
  const [goldRate, setGoldRate] = useState('')
  const [silverRate, setSilverRate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRates = async () => {
      const { data, error } = await supabase.from('metal_rates').select('*')

      if (error) {
        toast.error('Failed to fetch rates')
        return
      }

      const gold = data.find(d => d.metal_type === 'Gold')
      const silver = data.find(d => d.metal_type === 'Silver')
      setGoldRate(gold?.rate?.toString() || '')
      setSilverRate(silver?.rate?.toString() || '')
    }

    fetchRates()
  }, [])

  const handleUpdate = async () => {
    setLoading(true)

    const updates = [
      {
        metal_type: 'Gold',
        rate: Number(goldRate),
        updated_at: new Date().toISOString()
      },
      {
        metal_type: 'Silver',
        rate: Number(silverRate),
        updated_at: new Date().toISOString()
      }
    ]

    const { error } = await supabase
      .from('metal_rates')
      .upsert(updates, { onConflict: ['metal_type'] })

    setLoading(false)

    if (error) {
      toast.error('Failed to update metal rates')
    } else {
      toast.success('Metal rates updated successfully')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Update Metal Rates</h2>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Gold Rate (₹)</label>
          <Input
            type="number"
            value={goldRate}
            onChange={(e) => setGoldRate(e.target.value)}
            placeholder="Enter gold rate"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">Silver Rate (₹)</label>
          <Input
            type="number"
            value={silverRate}
            onChange={(e) => setSilverRate(e.target.value)}
            placeholder="Enter silver rate"
          />
        </div>

        <Button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-blue-600 text-white"
        >
          {loading ? 'Updating...' : 'Update Rates'}
        </Button>
      </div>
    </div>
  )
}
