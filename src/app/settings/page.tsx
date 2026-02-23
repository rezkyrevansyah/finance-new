'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { formatRupiah, getPeriodLabel } from '@/lib/utils'
import { Trash2, AlertTriangle } from 'lucide-react'

interface ThrBonus {
  id: string
  label: string
  period: number
  year: number
  amount: number
}

interface ForceBalance {
  id: string
  period: number
  year: number
  amount: number
  reason?: string | null
}

export default function SettingsPage() {
  const [config, setConfig] = useState({ monthly_salary: 0, initial_balance: 0 })
  const [monthlySalary, setMonthlySalary] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [thrBonuses, setThrBonuses] = useState<ThrBonus[]>([])
  const [forceBalances, setForceBalances] = useState<ForceBalance[]>([])

  // THR Form
  const [thrLabel, setThrLabel] = useState('')
  const [thrPeriod, setThrPeriod] = useState('1')
  const [thrAmount, setThrAmount] = useState('')

  // Force Balance Form
  const [fbPeriod, setFbPeriod] = useState('1')
  const [fbAmount, setFbAmount] = useState('')
  const [fbReason, setFbReason] = useState('')

  // Delete dialogs
  const [deleteThrId, setDeleteThrId] = useState<string | null>(null)
  const [deleteFbId, setDeleteFbId] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [configRes, thrRes, fbRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/thr'),
        fetch('/api/force-balance'),
      ])

      const configData = await configRes.json()
      const thrData = await thrRes.json()
      const fbData = await fbRes.json()

      setConfig(configData)
      setMonthlySalary(String(configData.monthly_salary))
      setInitialBalance(String(configData.initial_balance))
      setThrBonuses(thrData)
      setForceBalances(fbData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      await Promise.all([
        fetch('/api/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'monthly_salary', value: monthlySalary }),
        }),
        fetch('/api/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'initial_balance', value: initialBalance }),
        }),
      ])
      toast.success('Konfigurasi berhasil disimpan')
      fetchData()
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Gagal menyimpan konfigurasi')
    } finally {
      setIsSaving(false)
    }
  }

  const addThr = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/thr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: thrLabel,
          period: parseInt(thrPeriod),
          year: 2026,
          amount: parseFloat(thrAmount),
        }),
      })

      if (!response.ok) throw new Error('Failed to add THR')

      toast.success('THR berhasil ditambahkan')
      setThrLabel('')
      setThrPeriod('1')
      setThrAmount('')
      fetchData()
    } catch (error) {
      console.error('Error adding THR:', error)
      toast.error('Gagal menambahkan THR')
    }
  }

  const deleteThr = async () => {
    if (!deleteThrId) return

    // Optimistic update - instant UI
    const idToDelete = deleteThrId
    setThrBonuses((prev) => prev.filter((t) => t.id !== idToDelete))
    setDeleteThrId(null)

    try {
      const response = await fetch(`/api/thr?id=${idToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete THR')

      toast.success('THR berhasil dihapus')
    } catch (error) {
      console.error('Error deleting THR:', error)
      toast.error('Gagal menghapus THR')
      // Rollback: refetch
      fetchData()
    }
  }

  const setForceBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/force-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: parseInt(fbPeriod),
          year: 2026,
          amount: parseFloat(fbAmount),
          reason: fbReason || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to set force balance')

      toast.success('Force balance berhasil diset')
      setFbPeriod('1')
      setFbAmount('')
      setFbReason('')
      fetchData()
    } catch (error) {
      console.error('Error setting force balance:', error)
      toast.error('Gagal menyimpan force balance')
    }
  }

  const deleteForceBalance = async () => {
    if (!deleteFbId) return

    // Optimistic update - instant UI
    const idToDelete = deleteFbId
    setForceBalances((prev) => prev.filter((fb) => fb.id !== idToDelete))
    setDeleteFbId(null)

    try {
      const response = await fetch(`/api/force-balance?id=${idToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete force balance')

      toast.success('Force balance berhasil dihapus')
    } catch (error) {
      console.error('Error deleting force balance:', error)
      toast.error('Gagal menghapus force balance')
      // Rollback: refetch
      fetchData()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">Configure salary, THR, and force balance</p>
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Configure salary, THR, and force balance</p>
      </div>

      {/* Section 1: Konfigurasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Dasar</CardTitle>
          <CardDescription>Atur gaji bulanan dan saldo awal tahun 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary">Monthly Salary (Rp)</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                step="1000"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                Saat ini: {formatRupiah(config.monthly_salary)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial">Initial Balance (1 Jan 2026)</Label>
              <Input
                id="initial"
                type="number"
                min="0"
                step="1000"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                Saat ini: {formatRupiah(config.initial_balance)}
              </p>
            </div>
          </div>
          <Button onClick={saveConfig} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: THR Bonus */}
      <Card>
        <CardHeader>
          <CardTitle>THR Bonus</CardTitle>
          <CardDescription>
            Tambahkan THR yang akan diterima di periode tertentu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* THR List */}
          {thrBonuses.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thrBonuses.map((thr) => (
                  <TableRow key={thr.id}>
                    <TableCell className="font-medium">{thr.label}</TableCell>
                    <TableCell>{getPeriodLabel(thr.period)}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatRupiah(thr.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteThrId(thr.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* THR Form */}
          <form onSubmit={addThr} className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Tambah THR Baru</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="thr-label">Label</Label>
                <Input
                  id="thr-label"
                  value={thrLabel}
                  onChange={(e) => setThrLabel(e.target.value)}
                  placeholder="e.g. THR Lebaran"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thr-period">Periode</Label>
                <Select value={thrPeriod} onValueChange={setThrPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => {
                      const period = i + 1
                      return (
                        <SelectItem key={period} value={String(period)}>
                          {getPeriodLabel(period)}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thr-amount">Jumlah (Rp)</Label>
                <Input
                  id="thr-amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={thrAmount}
                  onChange={(e) => setThrAmount(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <Button type="submit">Tambah THR</Button>
          </form>
        </CardContent>
      </Card>

      {/* Section 3: Force Set End Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Force Set End Balance</CardTitle>
          <CardDescription>
            Override saldo akhir periode tertentu (akan cascade ke periode berikutnya)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>
              <strong>Perhatian:</strong> Perubahan ini akan cascade ke semua periode
              berikutnya. Gunakan fitur ini hanya untuk koreksi manual.
            </p>
          </div>

          {/* Force Balance List */}
          {forceBalances.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forceBalances.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="font-medium">
                      {getPeriodLabel(fb.period)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(fb.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {fb.reason || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteFbId(fb.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Force Balance Form */}
          <form onSubmit={setForceBalance} className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Set Force Balance</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fb-period">Periode</Label>
                <Select value={fbPeriod} onValueChange={setFbPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => {
                      const period = i + 1
                      return (
                        <SelectItem key={period} value={String(period)}>
                          {getPeriodLabel(period)}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fb-amount">Amount (Rp)</Label>
                <Input
                  id="fb-amount"
                  type="number"
                  step="1000"
                  value={fbAmount}
                  onChange={(e) => setFbAmount(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fb-reason">Alasan (Opsional)</Label>
                <Input
                  id="fb-reason"
                  value={fbReason}
                  onChange={(e) => setFbReason(e.target.value)}
                  placeholder="Alasan override..."
                />
              </div>
            </div>
            <Button type="submit">Set Force Balance</Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete THR Dialog */}
      <Dialog open={!!deleteThrId} onOpenChange={() => setDeleteThrId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus THR</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus THR ini? Aksi ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteThrId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={deleteThr}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Force Balance Dialog */}
      <Dialog open={!!deleteFbId} onOpenChange={() => setDeleteFbId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Force Balance</DialogTitle>
            <DialogDescription>
              Menghapus force balance akan mengembalikan saldo ke hasil kalkulasi normal.
              Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFbId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={deleteForceBalance}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
