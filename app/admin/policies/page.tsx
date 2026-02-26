'use client';

import { useState, useEffect } from 'react';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { PolicyEditor } from '@/components/organisms/PolicyEditor';
import { updatePolicy } from '@/actions/policies';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/atoms/Spinner';
import { cn } from '@/lib/utils';
import type { Policy } from '@/types/policy';

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState<'warranty' | 'returns'>('warranty');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('policies').select('*');
      setPolicies((data || []) as Policy[]);
      setIsFetching(false);
    };
    fetchPolicies();
  }, []);

  const activePolicy = policies.find(p => p.type === activeTab);

  const handleSave = async (content: string, effectiveDate: string) => {
    setIsLoading(true);
    try {
      await updatePolicy(activeTab, content, effectiveDate);
      alert('Policy updated successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update policy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPageTemplate title="Policies" description="Manage warranty and returns policies">
      <div className="flex gap-2 mb-6">
        {(['warranty', 'returns'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              activeTab === tab
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {isFetching ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : activePolicy ? (
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <PolicyEditor
            key={activeTab}
            initialContent={activePolicy.content}
            effectiveDate={activePolicy.effective_date}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <p className="text-gray-500">No policy found for {activeTab}.</p>
      )}
    </AdminPageTemplate>
  );
}
