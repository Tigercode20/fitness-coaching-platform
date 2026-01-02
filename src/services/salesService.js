import Parse from './back4app'

// إنشاء مبيعة جديدة
export const createSale = async (saleData) => {
    try {
        const Sale = Parse.Object.extend('Sale')
        const sale = new Sale()

        // تعيين جميع الحقول مع timestamp
        sale.set('email', saleData.email)
        sale.set('subscriptionType', saleData.subscriptionType)
        sale.set('clientCode', saleData.clientCode)
        sale.set('clientName', saleData.clientName)
        sale.set('phoneNumber', saleData.phoneNumber)
        sale.set('amountPaid', parseFloat(saleData.amountPaid))
        sale.set('currency', saleData.currency)
        sale.set('receiveAccount', saleData.receiveAccount)
        sale.set('package', saleData.package)
        // Ensure dates are saved as Date objects
        sale.set('startDate', new Date(saleData.startDate))
        sale.set('duration', parseInt(saleData.duration))
        sale.set('bonusDuration', parseInt(saleData.bonusDuration))
        sale.set('receiveTrainingPlan', saleData.receiveTrainingPlan)
        sale.set('notes', saleData.notes)

        // Timestamp الإنشاء (Duplicate of default createdAt, but explicitly requested)
        // If saleData.timestamp is provided, use it, otherwise now.
        const timestamp = saleData.timestamp ? new Date(saleData.timestamp) : new Date();
        sale.set('timestamp', timestamp)

        if (saleData.clientId) {
            sale.set('clientId', saleData.clientId)
        }

        // رفع الصورة إذا كانت موجودة
        if (saleData.screenshot) {
            // Sanitize filename just in case
            const safeName = `${Date.now()}_screenshot.jpg`;
            const parseFile = new Parse.File(safeName, saleData.screenshot)
            await parseFile.save()
            sale.set('screenshotUrl', parseFile.url())
        }

        await sale.save()
        console.log('✅ تم حفظ المبيعة:', sale.id)
        return sale
    } catch (error) {
        console.error('❌ خطأ في حفظ المبيعة:', error.message)
        throw error
    }
}

// جلب جميع المبيعات
export const getSalesBy = async () => {
    try {
        const query = new Parse.Query('Sale')
        query.descending('timestamp') // من الأحدث للأقدم
        query.limit(1000)
        const results = await query.find()
        return results
    } catch (error) {
        console.error('❌ خطأ في جلب المبيعات:', error.message)
        throw error
    }
}

// جلب مبيعات عميل معين
export const getSalesByClient = async (clientId) => {
    try {
        const query = new Parse.Query('Sale')
        query.equalTo('clientId', clientId)
        query.descending('timestamp')
        const results = await query.find()
        return results
    } catch (error) {
        console.error('❌ خطأ:', error.message)
        throw error
    }
}

// تحديث مبيعة
export const updateSale = async (saleId, updatedData) => {
    try {
        const query = new Parse.Query('Sale')
        const sale = await query.get(saleId)

        Object.keys(updatedData).forEach(key => {
            if (key === 'screenshot' && updatedData[key]) {
                // Handle image update logic if needed, but usually we just set URL
            } else {
                sale.set(key, updatedData[key])
            }
        })

        await sale.save()
        return sale
    } catch (error) {
        console.error('❌ خطأ في التحديث:', error.message)
        throw error
    }
}

// حذف مبيعة
export const deleteSale = async (saleId) => {
    try {
        const query = new Parse.Query('Sale')
        const sale = await query.get(saleId)
        await sale.destroy()
        return true
    } catch (error) {
        console.error('❌ خطأ في الحذف:', error.message)
        throw error
    }
}
