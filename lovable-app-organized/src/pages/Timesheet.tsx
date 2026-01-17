import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deliverables, currentUser, timeEntries as initialTimeEntries } from '@/data/mockData';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Clock } from 'lucide-react';

const Timesheet = () => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [hours, setHours] = useState<Record<string, number>>({});

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getHoursForDay = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return hours[key] ?? 8;
  };

  const setHoursForDay = (date: Date, value: number) => {
    const key = format(date, 'yyyy-MM-dd');
    setHours((prev) => ({ ...prev, [key]: value }));
  };

  const totalHours = weekDays.reduce((sum, day) => sum + getHoursForDay(day), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timesheet</h1>
            <p className="text-muted-foreground">Track your weekly hours</p>
          </div>
          <Button className="gradient-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-2" />
            Save Timesheet
          </Button>
        </div>

        {/* Week Navigation */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h3 className="font-semibold">
                  Week of {format(currentWeek, 'MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(currentWeek, 'MMM d')} -{' '}
                  {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timesheet Grid */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Daily Hours Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-4 rounded-xl border ${
                      isToday
                        ? 'border-primary bg-primary/5'
                        : isWeekend
                        ? 'bg-muted/50'
                        : 'border-border'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        {format(day, 'EEE')}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          isToday ? 'text-primary' : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={getHoursForDay(day)}
                      onChange={(e) =>
                        setHoursForDay(day, parseFloat(e.target.value) || 0)
                      }
                      className="text-center text-lg font-medium"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      hours
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-xl bg-muted/30 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Total</p>
                <p className="text-3xl font-bold">{totalHours} hours</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Expected</p>
                <p className="text-3xl font-bold text-muted-foreground">40 hours</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Difference</p>
                <p
                  className={`text-3xl font-bold ${
                    totalHours >= 40 ? 'text-success' : 'text-warning'
                  }`}
                >
                  {totalHours >= 40 ? '+' : ''}
                  {totalHours - 40} hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Time by Deliverable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliverables.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.progress}% complete
                    </p>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="0"
                      className="text-right"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">hrs</span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                Add Another Deliverable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Timesheet;
