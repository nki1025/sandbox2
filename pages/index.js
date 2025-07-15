import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, XCircle, Search, CalendarDays, ChevronRight, ChevronLeft, Save, Edit } from 'lucide-react'; // アイコンのインポート

// モックデータ: 納品伝票のリスト
const mockDeliveries = [
  {
    id: 'D001',
    deliveryDate: '2025-07-09',
    supplier: '鮮魚市場',
    status: 'pending', // 未検品
    items: [
      { id: 'I001', name: '真鯛（養殖）', quantityOrdered: 5, quantityReceived: null, unit: 'kg', status: 'pending', rejectionReason: '' },
      { id: 'I002', name: '本マグロ（赤身）', Git: GitHubにサインインquantityOrdered: 3, quantityReceived: null, unit: 'kg', status: 'pending', rejectionReason: '' },
      { id: 'I003', name: '活アワビ', quantityOrdered: 10, quantityReceived: null, unit: '個', status: 'pending', rejectionReason: '' },
    ],
  },
  {
    id: 'D002',
    deliveryDate: '2025-07-09',
    supplier: '青果問屋',
    status: 'pending', // 未検品
    items: [
      { id: 'I004', name: 'レタス', quantityOrdered: 10, quantityReceived: null, unit: '玉', status: 'pending', rejectionReason: '' },
      { id: 'I005', name: 'トマト', quantityOrdered: 5, quantityReceived: null, unit: '箱', status: 'pending', rejectionReason: '' },
      { id: 'I006', name: '長ネギ', quantityOrdered: 20, quantityReceived: null, unit: '本', status: 'pending', rejectionReason: '' },
    ],
  },
  {
    id: 'D003',
    deliveryDate: '2025-07-08',
    supplier: '精肉卸',
    status: 'received', // 受領済み
    items: [
      { id: 'I007', name: '国産豚バラ肉', quantityOrdered: 10, quantityReceived: 10, unit: 'kg', status: 'received', rejectionReason: '' },
      { id: 'I008', name: '国産鶏もも肉', quantityOrdered: 15, quantityReceived: 15, unit: 'kg', status: 'received', rejectionReason: '' },
    ],
  },
  {
    id: 'D004',
    deliveryDate: '2025-07-07',
    supplier: '酒類販売',
    status: 'partially_rejected', // 一部差し戻し
    items: [
      { id: 'I009', name: '生ビール樽', quantityOrdered: 2, quantityReceived: 2, unit: '個', status: 'received', rejectionReason: '' },
      { id: 'I010', name: '日本酒（純米吟醸）', quantityOrdered: 6, quantityReceived: 5, unit: '本', status: 'rejected', rejectionReason: '破損のため1本差し戻し' },
    ],
  },
  {
    id: 'D005',
    deliveryDate: '2025-07-06',
    supplier: '米穀店',
    status: 'pending', // 未検品 (受領忘れシナリオ用)
    items: [
      { id: 'I011', name: 'コシヒカリ', quantityOrdered: 30, quantityReceived: null, unit: 'kg', status: 'pending', rejectionReason: '' },
      { id: 'I012', name: 'もち米', quantityOrdered: 5, quantityReceived: null, unit: 'kg', status: 'pending', rejectionReason: '' },
    ],
  },
];

// RejectionReasonModal コンポーネント
const RejectionReasonModal = ({ isOpen, onClose, onSubmit, itemName }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(reason);
    setReason(''); // Reset reason after submission
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">「{itemName}」の差し戻し理由</h3>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
          rows="4"
          placeholder="差し戻し理由を入力してください..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => { onClose(); setReason(''); }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            差し戻し確定
          </button>
        </div>
      </div>
    </div>
  );
};

// メインアプリケーションコンポーネント
const App = () => {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [currentDeliveryDetails, setCurrentDeliveryDetails] = useState(null); // 編集中の伝票詳細
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // 今日の日付で初期化

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [itemToReject, setItemToReject] = useState(null); // 差し戻し対象のアイテム

  // selectedDeliveryIdが変更されたら、currentDeliveryDetailsを更新
  useEffect(() => {
    if (selectedDeliveryId) {
      const delivery = deliveries.find(d => d.id === selectedDeliveryId);
      // ディープコピーを作成して、元のdeliveries配列に影響を与えずに編集できるようにする
      setCurrentDeliveryDetails(JSON.parse(JSON.stringify(delivery)));
    } else {
      setCurrentDeliveryDetails(null);
    }
  }, [selectedDeliveryId, deliveries]);

  // フィルタリングされた納品伝票のリスト
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          delivery.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? delivery.deliveryDate === filterDate : true;
    return matchesSearch && matchesDate;
  });

  // 納品伝票を選択するハンドラ
  const handleSelectDelivery = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
  };

  // 納品伝票リストに戻るハンドラ
  const handleBackToList = () => {
    setSelectedDeliveryId(null);
  };

  // 日付フィルターの変更ハンドラ
  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  // 日付を前日に変更
  const handlePreviousDay = () => {
    const currentDate = new Date(filterDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setFilterDate(currentDate.toISOString().split('T')[0]);
  };

  // 日付を翌日に変更
  const handleNextDay = () => {
    const currentDate = new Date(filterDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setFilterDate(currentDate.toISOString().split('T')[0]);
  };

  // ステータスに応じたアイコンと色を返すヘルパー関数
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center text-yellow-600"><Package className="w-4 h-4 mr-1" />未検品</span>;
      case 'received':
        return <span className="flex items-center text-green-600"><CheckCircle2 className="w-4 h-4 mr-1" />受領済み</span>;
      case 'partially_rejected':
        return <span className="flex items-center text-orange-600"><XCircle className="w-4 h-4 mr-1" />一部差し戻し</span>;
      case 'rejected':
        return <span className="flex items-center text-red-600"><XCircle className="w-4 h-4 mr-1" />差し戻し済み</span>;
      default:
        return status;
    }
  };

  // 明細の受領処理
  const handleReceiveItem = (itemId) => {
    if (!currentDeliveryDetails) return;

    const updatedItems = currentDeliveryDetails.items.map(item => {
      if (item.id === itemId) {
        return { ...item, status: 'received', quantityReceived: item.quantityOrdered };
      }
      return item;
    });
    setCurrentDeliveryDetails({ ...currentDeliveryDetails, items: updatedItems });
  };

  // 明細の差し戻し処理（モーダル表示）
  const handleInitiateRejectItem = (item) => {
    setItemToReject(item);
    setIsRejectionModalOpen(true);
  };

  // 明細の差し戻し確定処理（モーダルから）
  const handleConfirmRejectItem = (reason) => {
    if (!currentDeliveryDetails || !itemToReject) return;

    const updatedItems = currentDeliveryDetails.items.map(item => {
      if (item.id === itemToReject.id) {
        return { ...item, status: 'rejected', quantityReceived: 0, rejectionReason: reason };
      }
      return item;
    });
    setCurrentDeliveryDetails({ ...currentDeliveryDetails, items: updatedItems });
    setIsRejectionModalOpen(false);
    setItemToReject(null);
  };

  // 受領数の変更ハンドラ
  const handleQuantityReceivedChange = (itemId, value) => {
    if (!currentDeliveryDetails) return;
    const updatedItems = currentDeliveryDetails.items.map(item => {
      if (item.id === itemId) {
        const newQuantity = parseInt(value, 10);
        return { ...item, quantityReceived: isNaN(newQuantity) ? 0 : newQuantity };
      }
      return item;
    });
    setCurrentDeliveryDetails({ ...currentDeliveryDetails, items: updatedItems });
  };

  // 検品完了（変更の確定）
  const handleFinalizeInspection = () => {
    if (!currentDeliveryDetails) return;

    // 伝票全体のステータスを再評価
    let newDeliveryStatus = 'pending';
    const allItemsReceived = currentDeliveryDetails.items.every(item => item.status === 'received');
    const anyItemRejected = currentDeliveryDetails.items.some(item => item.status === 'rejected');
    const allItemsRejected = currentDeliveryDetails.items.every(item => item.status === 'rejected');

    if (allItemsReceived) {
      newDeliveryStatus = 'received';
    } else if (anyItemRejected) {
      newDeliveryStatus = allItemsRejected ? 'rejected' : 'partially_rejected';
    } else {
      // まだpendingのアイテムがある場合
      newDeliveryStatus = 'pending';
    }

    const finalDelivery = { ...currentDeliveryDetails, status: newDeliveryStatus };

    // deliveries配列を更新
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(d => (d.id === finalDelivery.id ? finalDelivery : d))
    );

    // 詳細ビューを閉じてリストに戻る
    setSelectedDeliveryId(null);
  };


  return (
    <div className="min-h-screen bg-gray-100 font-inter p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 w-full max-w-4xl border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">納品検品システム</h1>

        {currentDeliveryDetails ? (
          // 納品伝票詳細ビュー
          <div>
            <button
              onClick={handleBackToList}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> 納品伝票リストに戻る
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
              納品伝票詳細: {currentDeliveryDetails.id} - {currentDeliveryDetails.supplier}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-gray-600 text-sm sm:text-base">
              <p><strong>納品日:</strong> {currentDeliveryDetails.deliveryDate}</p>
              <p><strong>ステータス:</strong> {getStatusDisplay(currentDeliveryDetails.status)}</p>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      発注数
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      単位
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      検品ステータス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受領数
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      差し戻し理由
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDeliveryDetails.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.quantityOrdered}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {item.status === 'pending' && <span className="text-yellow-600">未検品</span>}
                        {item.status === 'received' && <span className="text-green-600">受領</span>}
                        {item.status === 'rejected' && <span className="text-red-600">差し戻し</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.status === 'pending' || item.status === 'received' ? (
                          <input
                            type="number"
                            min="0"
                            value={item.quantityReceived !== null ? item.quantityReceived : item.quantityOrdered}
                            onChange={(e) => handleQuantityReceivedChange(item.id, e.target.value)}
                            className="w-20 p-1 border border-gray-300 rounded-md text-center"
                          />
                        ) : (
                          item.quantityReceived !== null ? item.quantityReceived : '-'
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.rejectionReason || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {item.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReceiveItem(item.id)}
                              className="p-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 shadow-sm"
                              title="受領"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInitiateRejectItem(item)}
                              className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-sm"
                              title="差し戻し"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">完了</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleFinalizeInspection}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <Save className="w-5 h-5 mr-2" /> 検品完了
              </button>
            </div>
          </div>
        ) : (
          // 納品伝票リストビュー
          <div>
            <div className="flex flex-col sm:flex-row items-center mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="サプライヤー名または伝票番号で検索..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center w-full sm:w-auto">
                <button
                  onClick={handlePreviousDay}
                  className="p-2 rounded-l-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  title="前日"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="relative flex-grow">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="pl-10 pr-4 py-2 border-t border-b border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500"
                    value={filterDate}
                    onChange={handleDateChange}
                  />
                </div>
                <button
                  onClick={handleNextDay}
                  className="p-2 rounded-r-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  title="翌日"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredDeliveries.length === 0 ? (
                <p className="text-center text-gray-500">該当する納品伝票はありません。</p>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors duration-200 flex items-center justify-between"
                    onClick={() => handleSelectDelivery(delivery.id)}
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        <span className="font-bold">{delivery.supplier}</span> - {delivery.id}
                      </p>
                      <p className="text-sm text-gray-600">{delivery.deliveryDate}</p>
                    </div>
                    {getStatusDisplay(delivery.status)}
                    <ChevronRight className="w-5 h-5 text-gray-500 ml-2" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <RejectionReasonModal
          isOpen={isRejectionModalOpen}
          onClose={() => setIsRejectionModalOpen(false)}
          onSubmit={handleConfirmRejectItem}
          itemName={itemToReject ? itemToReject.name : ''}
        />
      </div>
    </div>
  );
};

export default App;
