import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUmbrellas } from '@/hooks/useUmbrellas';
import { LOCATIONS, Umbrella } from '@/types/umbrella';

const returnSchema = z.object({
  umbrellaId: z.number().min(1).max(21),
  location: z.enum(LOCATIONS as readonly [string, ...string[]])
});

type ReturnFormData = z.infer<typeof returnSchema>;

export default function FormReturn() {
  const [selectedUmbrella, setSelectedUmbrella] = useState<Umbrella | null>(null);
  const { toast } = useToast();
  const { getBorrowedUmbrellas, returnUmbrella, loading, umbrellas } = useUmbrellas();
  
  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      umbrellaId: 0,
      location: ''
    }
  });

  const borrowedUmbrellas = getBorrowedUmbrellas();

  const watchUmbrellaId = form.watch('umbrellaId');

  useEffect(() => {
    if (watchUmbrellaId) {
      const umbrella = umbrellas.find(u => u.id === watchUmbrellaId);
      setSelectedUmbrella(umbrella || null);
    } else {
      setSelectedUmbrella(null);
    }
  }, [watchUmbrellaId, umbrellas]);

  const onSubmit = async (data: ReturnFormData) => {
    const success = await returnUmbrella(data.umbrellaId, data.location);
    
    if (success) {
      toast({
        title: "สำเร็จ!",
        description: `คืนร่ม #${data.umbrellaId} เรียบร้อยแล้ว`,
        variant: "default"
      });
      form.reset();
      setSelectedUmbrella(null);
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคืนร่มได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (borrowedAt: string) => {
    const now = new Date();
    const borrowed = new Date(borrowedAt);
    const diffMs = now.getTime() - borrowed.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} นาที`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (remainingMins === 0) {
      return `${diffHours} ชั่วโมง`;
    }
    
    return `${diffHours} ชั่วโมง ${remainingMins} นาที`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary to-emerald-600 text-white">
          <CardTitle className="text-xl font-semibold flex items-center">
            <i className="fas fa-undo mr-3"></i>
            แบบฟอร์มคืนร่ม
          </CardTitle>
          <p className="text-emerald-100 text-sm">กรุณาระบุหมายเลขร่มที่ต้องการคืน</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <FormField
                  control={form.control}
                  name="umbrellaId"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="floating-label absolute left-4 -top-2 left-2 scale-85 text-secondary bg-white px-2">
                        หมายเลขร่ม
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-4 border border-gray-300 rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all">
                            <SelectValue placeholder="เลือกหมายเลขร่มที่ต้องการคืน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {borrowedUmbrellas.map((umbrella) => (
                            <SelectItem key={umbrella.id} value={umbrella.id.toString()}>
                              ร่ม #{umbrella.id} - ยืมโดย: {umbrella.borrower}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="flex items-center mt-2">
                        <i className="fas fa-hashtag text-gray-400 text-sm mr-2"></i>
                        <span className="text-xs text-gray-500">เลือกจากร่มที่ถูกยืมไป</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="floating-label absolute left-4 -top-2 left-2 scale-85 text-secondary bg-white px-2">
                        สถานที่คืน
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-4 border border-gray-300 rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all">
                            <SelectValue placeholder="เลือกสถานที่คืน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOCATIONS.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="flex items-center mt-2">
                        <i className="fas fa-map-marker-alt text-gray-400 text-sm mr-2"></i>
                        <span className="text-xs text-gray-500">จุดที่ท่านคืนร่ม</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Borrowed Details Display */}
              {selectedUmbrella && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 animate-slide-up">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">ข้อมูลการยืม</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ผู้ยืม:</span>
                      <span className="font-medium ml-2">{selectedUmbrella.borrower}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ยืมเมื่อ:</span>
                      <span className="font-medium ml-2">
                        {selectedUmbrella.borrowedAt ? 
                          new Date(selectedUmbrella.borrowedAt).toLocaleTimeString('th-TH', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'ไม่ทราบ'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">สถานที่ยืม:</span>
                      <span className="font-medium ml-2">{selectedUmbrella.borrowLocation}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ระยะเวลา:</span>
                      <span className="font-medium ml-2 text-orange-600">
                        {selectedUmbrella.borrowedAt ? formatDuration(selectedUmbrella.borrowedAt) : 'ไม่ทราบ'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center text-lg shadow-lg hover:shadow-xl"
                disabled={form.formState.isSubmitting}
              >
                <i className="fas fa-check-circle mr-3"></i>
                {form.formState.isSubmitting ? 'กำลังดำเนินการ...' : 'คืนร่ม'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
