from django.urls import path
from .views import DayBookExcelView, LedgerReportExcelView, TrialBalanceExcelView, StockSummaryExcelView, GSTReportExcelView

urlpatterns = [
    path('daybook/excel', DayBookExcelView.as_view(), name='daybook-excel'),
    path('ledger/excel', LedgerReportExcelView.as_view(), name='ledger-excel'),
    path('trialbalance/excel', TrialBalanceExcelView.as_view(), name='trialbalance-excel'),
    path('stocksummary/excel', StockSummaryExcelView.as_view(), name='stocksummary-excel'),
    path('gst/excel', GSTReportExcelView.as_view(), name='gst-excel'),
]
