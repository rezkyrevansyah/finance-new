'use client'

import { PeriodData } from '@/lib/cashflow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CashFlowTable } from '@/components/dashboard/CashFlowTable'
import { CashFlowTimeline } from '@/components/dashboard/CashFlowTimeline'
import { Table2, LayoutList } from 'lucide-react'

interface CashFlowSectionProps {
  periods: PeriodData[]
  currentPeriod: number
}

export function CashFlowSection({ periods, currentPeriod }: CashFlowSectionProps) {
  return (
    <Tabs defaultValue="table">
      {/* Section header + tab switcher */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Cashflow 2026</h2>
          <p className="text-sm text-slate-500 mt-1">Breakdown periode per bulan</p>
        </div>
        <TabsList className="shrink-0">
          <TabsTrigger value="table" className="flex items-center gap-1.5">
            <Table2 className="h-3.5 w-3.5" />
            <span>Tabel</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1.5">
            <LayoutList className="h-3.5 w-3.5" />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="table" className="mt-0">
        <CashFlowTable periods={periods} currentPeriod={currentPeriod} hideHeader />
      </TabsContent>

      <TabsContent value="timeline" className="mt-0">
        <CashFlowTimeline periods={periods} currentPeriod={currentPeriod} />
      </TabsContent>
    </Tabs>
  )
}
