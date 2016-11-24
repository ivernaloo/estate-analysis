require 'csv'
class BusesHouses < ActiveRecord::Base

  def self.to_csv
    attributes = %w{id bus_id house_id}

    CSV.generate(headers: true) do |csv|
      csv << attributes

      BusesHouses.all.each do |col|
        csv << attributes.map { |attr| col.send(attr) }
      end
    end
  end

end
