import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUmbrellas } from '@/hooks/useUmbrellas';
import { BorrowForm, LOCATIONS } from '@/types/umbrella';
import QRScanner from './QRScanner';

const borrowSchema = z.object({
  nickname: z.string().min(1, 'กรุณากรอกชื่อเล่น'),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'),
  umbrellaId: z.number().min(1).max(21),
  location: z.enum(LOCATIONS as readonly [string, ...string[]])
});

type BorrowFormData = z.infer<typeof borrowSchema>;

export default function FormBorrow() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { toast } = useToast();
  const { getAvailableUmbrellas, borrowUmbrella, loading } = useUmbrellas();
  
  const form = useForm<BorrowFormData>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      nickname: '',
      phone: '',
      umbrellaId: 0,
      location: ''
    }
  });

  const availableUmbrellas = getAvailableUmbrellas();

  const onSubmit = async (data: BorrowFormData) => {
    const success = await borrowUmbrella(data.umbrellaId, data.nickname, data.phone, data.location);
    
    if (success) {
      toast({
        title: "สำเร็จ!",
        description: `ยืมร่ม #${data.umbrellaId} เรียบร้อยแล้ว`,
        variant: "default"
      });
      form.reset();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยืมร่มได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    }
  };

  const handleQRResult = (umbrellaId: number) => {
    form.setValue('umbrellaId', umbrellaId);
    setShowQRScanner(false);
    toast({
      title: "สแกนสำเร็จ",
      description: `เลือกร่ม #${umbrellaId} แล้ว`,
      variant: "default"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white">
          <CardTitle className="text-xl font-semibold flex items-center">
            <i className="fas fa-umbrella mr-3"></i>
            แบบฟอร์มยืมร่ม
          </CardTitle>
          <p className="text-blue-100 text-sm">กรุณากรอกข้อมูลให้ครบถ้วน</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="floating-label absolute left-4 top-4 text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:-top-2 peer-focus:left-2 peer-focus:scale-85 peer-focus:text-primary bg-white px-2">
                        ชื่อเล่น
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ชื่อเล่น"
                          className="peer px-4 py-4 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-transparent"
                        />
                      </FormControl>
                      <FormDescription className="flex items-center mt-2">
                        <i className="fas fa-user text-gray-400 text-sm mr-2"></i>
                        <span className="text-xs text-gray-500">ชื่อที่เรียกกันในห้องเรียน</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="floating-label absolute left-4 top-4 text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:-top-2 peer-focus:left-2 peer-focus:scale-85 peer-focus:text-primary bg-white px-2">
                        เบอร์โทรศัพท์
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="เบอร์โทรศัพท์"
                          maxLength={10}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                          className="peer px-4 py-4 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-transparent"
                        />
                      </FormControl>
                      <FormDescription className="flex items-center mt-2">
                        <i className="fas fa-phone text-gray-400 text-sm mr-2"></i>
                        <span className="text-xs text-gray-500">10 หลัก (ตัวเลขเท่านั้น)</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="umbrellaId"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="floating-label absolute left-4 -top-2 left-2 scale-85 text-primary bg-white px-2">
                        หมายเลขร่ม
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-4 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <SelectValue placeholder="เลือกหมายเลขร่ม" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUmbrellas.map((umbrella) => (
                            <SelectItem key={umbrella.id} value={umbrella.id.toString()}>
                              ร่ม #{umbrella.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="flex items-center mt-2">
                        <i className="fas fa-hashtag text-gray-400 text-sm mr-2"></i>
                        <span className="text-xs text-gray-500">เลือกจากร่มที่ว่าง</span>
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
                      <FormLabel className="floating-label absolute left-4 -top-2 left-2 scale-85 text-primary bg-white px-2">
                        สถานที่ยืม
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-4 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <SelectValue placeholder="เลือกสถานที่ยืม" />
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
                        <span className="text-xs text-gray-500">จุดที่ท่านยืมร่ม</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* QR Code Scanner Button */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-qrcode text-primary text-lg mr-3"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">สแกน QR Code บนร่ม</p>
                      <p className="text-xs text-gray-600">เพื่อเลือกหมายเลขร่มอัตโนมัติ</p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => setShowQRScanner(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <i className="fas fa-camera mr-2"></i>
                    สแกน QR
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center text-lg shadow-lg hover:shadow-xl"
                disabled={form.formState.isSubmitting}
              >
                <i className="fas fa-check-circle mr-3"></i>
                {form.formState.isSubmitting ? 'กำลังดำเนินการ...' : 'ยืมร่ม'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <QRScanner 
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onResult={handleQRResult}
        availableUmbrellas={availableUmbrellas.map(u => u.id)}
      />
    </div>
  );
}
